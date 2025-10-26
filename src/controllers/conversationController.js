const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');

// إنشاء أو جلب محادثة بين مستخدمين
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body; // الـ طرف الآخر

    // هل فيه محادثة موجودة أصلاً؟
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    }).populate('lastMessage');

    // لو مش موجودة → أنشئ جديدة
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId]
      });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب كل المحادثات الخاصة بالمستخدم
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
