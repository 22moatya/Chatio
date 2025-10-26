const Room = require('../models/roomModel');
const Message = require('../models/messageModel');

// إنشاء روم جديد
exports.createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const room = await Room.create({
      name,
      description: description || '',
      createdBy: req.user._id,
      members: [req.user._id]
    });

    // رجّع الاسم بدل الـ id
    const populatedRoom = await room.populate('createdBy', 'name');

    res.status(201).json(populatedRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ضم المستخدم الحالي إلى روم معيّن
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        $addToSet: { members: req.user._id }
      },
      { new: true }
    ).populate('members', '-password');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب جميع الرومات
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب رومات مشارك فيها المستخدم
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id
    }).sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
