const { io } = require("socket.io-client");

// ⬅️ غيّر البورت لو مختلف
const socket = io("http://localhost:5000", {
  transports: ["websocket"]
});

// لما يحصل اتصال
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // ابعت التوكن بعد الاتصال
  socket.emit("setup", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGQwODMyMzA0Y2EyOWYzZTI5NWVjNCIsImVtYWlsIjoidXNlcjFAdGVzdC5jb20iLCJpYXQiOjE3NTkzOTcwNDgsImV4cCI6MTc2MTk4OTA0OH0.ZhR0kADSJ_txb8bqmEILKB1nYfmMwwpPo1T9_f8g45Q");
});

// رد السيرفر بعد التحقق
socket.on("connected", () => {
  console.log("🔥 Setup done, user authenticated");
});

// أخطاء
socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
