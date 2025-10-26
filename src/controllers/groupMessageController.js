const GroupMessage = require('../models/GroupMessage');
const Room = require('../models/roomModel');

// إرسال رسالة داخل روم
exports.sendGroupMessage = async (req, res) => {
  try {
    const { roomId, content, fileUrl } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const message = await GroupMessage.create({
      room: roomId,
      sender: req.user._id,
      content: content || '',
      fileUrl: fileUrl || ''
    });

    // تحديث آخر رسالة في الروم
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: message._id
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب رسائل روم معين (مع pagination)
exports.getGroupMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await GroupMessage.find({ room: roomId })
      .populate('sender', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
