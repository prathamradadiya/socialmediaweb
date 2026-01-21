const { io } = require("socket.io-client");

const socket = io("http://localhost:3001", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTZmY2FhMmY2ZDk1ZWExZGI5ODg4MGIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2ODk1MzkzOSwiZXhwIjoxNzY4OTU3NTM5fQ.JAysdA7cfViY_iYgd0x7DEIIZuVzPW01LESBQg6jw_Q",
  },
  transports: ["websocket"], // 👈 force WebSocket
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("sendMessage", {
    receiverId: "696ffbe113cd0b99087eec22",
    text: "Hello , B",
  });
});

socket.on("receiveMessage", (data) => {
  console.log("Message received:", data);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});
