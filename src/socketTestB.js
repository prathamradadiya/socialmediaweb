// const { io } = require("socket.io-client");

// const socket = io("http://localhost:3001", {
//   auth: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTcxMjVmNjVkYWJjNWJjNzZkMjQ4MjgiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTIwMzMzNSwiZXhwIjoxNzY5MjA2OTM1fQ.Zg_m-MZOyINST5o0D572xtk5jQyTbn1dasPPC8AxwW8",
//   },
//   transports: ["websocket"],
// });

// socket.on("connect", () => {
//   console.log("User B Connected:", socket.id);

//   const roomId = "697277727692060038e486b1";
//   socket.emit("joinChat", { roomId });
// });

// socket.on("chatHistory", (messages) => {
//   console.log("User B Chat history:", messages);

//   socket.emit("sendMessage", {
//     roomId: "697277727692060038e486b1",
//     text: "Hello from User B",
//   });
// });

// socket.on("receiveMessage", (data) => {
//   console.log("User B Received:", data);
// });

// socket.on("messageSent", (data) => {
//   console.log("User B Sent:", data);
// });

// socket.on("connect_error", (err) => {
//   console.log("User B Connection error:", err.message);
// });

// socket.on("disconnect", () => {
//   console.log("User B Disconnected");
// });
