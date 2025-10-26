const express = require('express');
const router = express.Router();

const { getAllUsers, searchUsers } = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.get('/', auth, getAllUsers);
router.get('/search', auth, searchUsers);

module.exports = router;
