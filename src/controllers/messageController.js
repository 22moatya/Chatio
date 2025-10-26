const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');

// إرسال رسالة جديدة
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, fileUrl } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content || '',
      fileUrl: fileUrl || ''
    });

    // تحديث آخر رسالة في المحادثة
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب رسائل محادثة معينة مع pagination
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
