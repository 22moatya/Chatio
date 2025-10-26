const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');

const onlineUsers = new Map(); // userId -> socketId
const BASE_AVATAR = "http://localhost:5000/uploads/imgs/";

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // 1) setup : تحقق من التوكن وارجاع بيانات المستخدم الحالية وقائمة الأونلاين
    socket.on('setup', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        onlineUsers.set(socket.userId, socket.id);

        // جلب بيانات المستخدم الحالي
        const me = await User.findById(socket.userId).select('name email avatar');

        // جلب بيانات المستخدمين الأونلاين
        const users = await User.find(
          { _id: { $in: Array.from(onlineUsers.keys()) } },
          'name email avatar'
        );

        const onlineList = users.map(u => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          avatar: BASE_AVATAR + (u.avatar || 'default.jpg')
        }));

        // تأكيد الاتصال مع إرجاع بيانات المستخدم الحالي
        socket.emit('connected', {
          me: { id: me._id.toString(), name: me.name, email: me.email, avatar: BASE_AVATAR + (me.avatar || 'default.jpg') }
        });

        // بث قائمة الأونلاين للجميع
        io.emit('online_users', onlineList);
      } catch (err) {
        console.log('❌ Invalid token', err?.message);
        socket.disconnect();
      }
    });

    // 2) join conversation : ينضم لغرفة المحادثة ويحول رسائل receiver من sent->delivered
    socket.on('join_conversation', async (conversationId) => {
      try {
        socket.join(conversationId);

        // تحديث رسائل مُرسلة للطرف الحاضر من 'sent' => 'delivered'
        await Message.updateMany(
          { conversation: conversationId, receiver: socket.userId, status: 'sent' },
          { $set: { status: 'delivered' } }
        );

        // جلب IDs الرسائل التي تحولت (للإخطار)
        const deliveredMsgs = await Message.find(
          { conversation: conversationId, receiver: socket.userId, status: 'delivered' },
          '_id'
        );
        const deliveredIds = deliveredMsgs.map(m => m._id.toString());

        // إخطار أعضاء المحادثة بأن بعض الرسائل تم توصيلها
        io.to(conversationId).emit('messages_delivered', {
          conversationId,
          deliveredIds
        });
      } catch (err) {
        console.error('❌ join_conversation error:', err.message);
      }
    });

    // 3) private_message : حفظ الرسالة وتعيين الحالة sent/delivered وإرسالها مع tempId
    socket.on('private_message', async ({ conversationId, content, fileUrl, tempId }) => {
      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;

        const receiverId = conv.participants.find(id => id.toString() !== socket.userId)?.toString();

        // تحقق إن المستلم متصل وبالفعل داخل نفس الغرفة => delivered
        let status = 'sent';
        if (receiverId) {
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            const receiverSocket = io.sockets.sockets.get(receiverSocketId);
            if (receiverSocket && receiverSocket.rooms.has(conversationId)) {
              status = 'delivered';
            }
          }
        }

        // إنشاء الرسالة بالـ status
        const newMessage = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content: content || '',
          fileUrl: fileUrl || '',
          messageType: fileUrl ? 'file' : 'text',
          status // 'sent' or 'delivered'
        });

        // تحديث آخر رسالة في المحادثة
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id });

        // جلب بيانات المرسل لرفعها مع البث
        const senderUser = await User.findById(socket.userId).select('name email avatar');

        // بث الرسالة لكل أعضاء الغرفة وإرسال tempId للراسل ليتعرف على الرسالة المؤقتة
        io.to(conversationId).emit('new_message', {
          _id: newMessage._id.toString(),
          tempId: tempId || null,
          conversation: conversationId,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
          status: newMessage.status,
          sender: {
            id: senderUser._id.toString(),
            name: senderUser.name,
            email: senderUser.email,
            avatar: BASE_AVATAR + (senderUser.avatar || 'default.jpg')
          }
        });
      } catch (err) {
        console.error('❌ private_message error:', err.message);
      }
    });

    // 4) mark_as_read : تحويل الرسائل إلى read وإخطار الراسل
    socket.on('mark_as_read', async ({ conversationId }) => {
      try {
        // جلب رسائل قابلة للتحديث (delivered أو sent) ثم تحويلها إلى read
        const toRead = await Message.find({
          conversation: conversationId,
          receiver: socket.userId,
          status: { $in: ['delivered', 'sent'] }
        }, '_id');

        const ids = toRead.map(m => m._id.toString());
        if (ids.length > 0) {
          await Message.updateMany({ _id: { $in: ids } }, { $set: { status: 'read', read: true } });
          // إخطار أعضاء المحادثة بتغيّر حالة هذه الرسائل
          io.to(conversationId).emit('messages_read', {
            conversationId,
            messageIds: ids,
            reader: socket.userId
          });
        }
      } catch (err) {
        console.error('❌ mark_as_read error:', err.message);
      }
    });

    // 5) typing indicators
    socket.on('typing', (conversationId) => {
      socket.to(conversationId).emit('typing', { userId: socket.userId });
    });
    socket.on('stop_typing', (conversationId) => {
      socket.to(conversationId).emit('stop_typing', { userId: socket.userId });
    });

    // 6) disconnect cleanup
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        // تحديث الأونلاين للجميع
        (async () => {
          try {
            const users = await User.find({ _id: { $in: Array.from(onlineUsers.keys()) } }, 'name email avatar');
            const onlineList = users.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, avatar: BASE_AVATAR + (u.avatar || 'default.jpg') }));
            io.emit('online_users', onlineList);
          } catch (err) {
            // ignore
          }
        })();
      }
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};
