const { io } = require("socket.io-client");

const socket = io("http://localhost:3001", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTcxMjVjNmI5NDY3YjlmZDIxNzIwNGIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTEwOTI4NywiZXhwIjoxNzY5MTEyODg3fQ.oKTNUTlXjttZ4456-aOx8FutJRBGzvvHmVVbAHAR5cg",
  },
  transports: ["websocket"],
});

//Connected
socket.on("connect", () => {
  console.log("Connected:", socket.id);

  const roomId = "697277727692060038e486b1";
  socket.emit("joinChat", roomId);
});

//Chat history
socket.on("chatHistory", (messages) => {
  console.log("Chat history:", messages);

  // Send message AFTER join success
  socket.emit("sendMessage", {
    roomId: "69724c62a3babeb1a124d21f",
    text: "can u come today",
  });
});

//Incoming message
socket.on("receiveMessage", (data) => {
  console.log("Message received:", data);
});

//Message sent
socket.on("messageSent", (data) => {
  console.log("Message sent:", data);
});

//Error handling
socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});

//Disconnected
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
