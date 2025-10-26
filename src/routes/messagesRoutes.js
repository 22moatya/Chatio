const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const {
  sendMessage,
  getMessages
} = require('../controllers/messageController');

// إرسال رسالة جديدة
router.post('/', auth, sendMessage);

// جلب رسائل محادثة معينة (مع pagination)
router.get('/:conversationId', auth, getMessages);

module.exports = router;
