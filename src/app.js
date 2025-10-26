const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const conversationRoutes = require('./routes/conversationsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const roomsRoutes = require('./routes/roomRoutes');
const groupMessageRoutes = require('./routes/groupMessagesRoutes');

const app = express();

// Middlewares أساسية
app.use(helmet());
app.use(cors({
  origin: '*',  // أو استخدم http://localhost:3000 لو عندك React
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));
// Logger في وضع التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test route مؤقت للتأكد أن السيرفر شغال
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});


app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/group-messages', groupMessageRoutes);





module.exports = app;
