const { io } = require("socket.io-client");

const socket = io("http://localhost:3001", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTcxMjVmNjVkYWJjNWJjNzZkMjQ4MjgiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTEwOTM5NywiZXhwIjoxNzY5MTEyOTk3fQ.BoCxC-pgmlBBfmRoqI-N4nic6oMAol425rhmUml1ONc",
  },
  transports: ["websocket"],
});
// Connected
socket.on("connect", () => {
  console.log("Connected:", socket.id);

  const roomId = "69724c62a3babeb1a124d21f";
  socket.emit("joinChat", roomId);
});

// Chat history
socket.on("chatHistory", (messages) => {
  console.log("Chat history:", messages);

  // Send message AFTER join success
  socket.emit("sendMessage", {
    roomId: "697277727692060038e486b1",
    text: "yes",
  });
});

//Incoming message (receiver)
socket.on("receiveMessage", (data) => {
  console.log("Message received:", data);
});

// Message sent (sender)
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
