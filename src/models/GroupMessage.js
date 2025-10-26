const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image', 'video'],
      default: 'text'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
