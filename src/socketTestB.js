const { io } = require("socket.io-client");

const socket = io("http://localhost:3001", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTZmZmJlMTEzY2QwYjk5MDg3ZWVjMjIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2ODk1NDExNCwiZXhwIjoxNzY4OTU3NzE0fQ.9y8hcmk1M4OwmqFsBTFhSollAoC5NeXq-ih-lUA2vCo",
  },
  transports: ["websocket"], // 👈 force WebSocket
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("sendMessage", {
    receiverId: "696fcaa2f6d95ea1db98880b",
    text: "Hello Node A",
  });
});

socket.on("receiveMessage", (data) => {
  console.log("Message received:", data);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});
