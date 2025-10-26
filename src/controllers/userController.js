const User = require('../models/userModel');

// جلب كل المستخدمين باستثناء المستخدم الحالي
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// البحث عن مستخدم بالاسم أو البريد
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('-password');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
