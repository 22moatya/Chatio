const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    avatar: {
      type: String,
      default: 'default.jpg'
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline'
    }
  },
  { timestamps: true }
);

// تشفير الباسورد قبل الحفظ
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// مقارنة كلمة المرور عند تسجيل الدخول
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// إنشاء JWT
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
