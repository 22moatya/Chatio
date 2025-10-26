const express = require('express');
const router = express.Router();

const {
  getOrCreateConversation,
  getMyConversations
} = require('../controllers/conversationController');

const auth = require('../middlewares/auth');

// إنشاء أو استرجاع محادثة بين مستخدمين
router.post('/', auth, getOrCreateConversation);

// جلب جميع المحادثات الخاصة بالمستخدم الحالي
router.get('/', auth, getMyConversations);

module.exports = router;
