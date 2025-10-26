const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { connectDB } = require('./config/DB');
const app = require('./app');
const { Server } = require('socket.io');
const socketHandlers = require('./sockets/serverIo');

// تحميل env
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

// اتصال قاعدة البيانات
const DB = process.env.DATABASE;
connectDB(DB);

// إنشاء HTTP Server
const server = http.createServer(app);

// تهيئة Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

socketHandlers(io);

// تشغيل السيرفر
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 App running on port ${port}...`);
});


// احتواء الأخطاء
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down..');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down..');
  console.log(err.name, err.message);
  process.exit(1);
});
