const User = require('../models/userModel');

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar
    });

    const token = user.generateJWT();
    res.status(201).json({
      user: {
        _id: user._id,
        username: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// تسجيل الدخول
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = user.generateJWT();
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// بيانات المستخدم الحالي
exports.me = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
