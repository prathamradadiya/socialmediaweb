// const { io } = require("socket.io-client");

// const socket = io("http://localhost:3001", {
//   auth: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTcxMjVjNmI5NDY3YjlmZDIxNzIwNGIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTIwMjg3MywiZXhwIjoxNzY5MjA2NDczfQ.WGztf-sNukhaTo9OnmM857n-_PmPsUMknXyhDh72fpw",
//   },
//   transports: ["websocket"],
// });

// socket.on("connect", () => {
//   console.log("User A Connected:", socket.id);

//   const roomId = "697277727692060038e486b1";
//   socket.emit("joinChat", { roomId });
// });

// socket.on("chatHistory", (messages) => {
//   console.log("User A Chat history:", messages);

//   socket.emit("sendMessage", {
//     roomId: "697277727692060038e486b1",
//     text: "Hello from User A",
//   });
// });

// socket.on("receiveMessage", (data) => {
//   console.log("User A Received:", data);
// });

// socket.on("messageSent", (data) => {
//   console.log("User A Sent:", data);
// });

// socket.on("connect_error", (err) => {
//   console.log("User A Connection error:", err.message);
// });

// socket.on("disconnect", () => {
//   console.log("User A Disconnected");
// });
const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const data = {
  name: "My API Key",
  scopes: ["mail.send", "alerts.create", "alerts.read"],
};

const request = {
  url: `/v3/api_keys`,
  method: "POST",
  body: data,
};

client
  .request(request)
  .then(([response, body]) => {
    console.log(response.statusCode);
    console.log(response.body);
  })
  .catch((error) => {
    console.error(error);
  });
