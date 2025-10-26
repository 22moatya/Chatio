const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
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
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    status: {
     type: String,
     enum: ['sent', 'delivered', 'read'],
     default: 'sent'
   }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
