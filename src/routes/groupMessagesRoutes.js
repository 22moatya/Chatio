const express = require('express');
const router = express.Router();

const {
  sendGroupMessage,
  getGroupMessages
} = require('../controllers/groupMessageController');

const auth = require('../middlewares/auth');

// إرسال رسالة داخل روم
router.post('/', auth, sendGroupMessage);

// جلب رسائل روم معيّن
router.get('/:roomId', auth, getGroupMessages);

module.exports = router;
