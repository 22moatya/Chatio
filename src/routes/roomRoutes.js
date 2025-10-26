const express = require('express');
const router = express.Router();

const {
  createRoom,
  joinRoom,
  getAllRooms,
  getMyRooms
} = require('../controllers/roomController');

const auth = require('../middlewares/auth');

// إنشاء روم جديد// جلب كل الرومات
router.route('/').post(auth, createRoom).get(auth, getAllRooms);

// انضمام المستخدم لروم معيّن
router.post('/:roomId/join', auth, joinRoom);

// جلب الرومات التي يشارك فيها المستخدم
router.get('/mine', auth, getMyRooms);

module.exports = router;
