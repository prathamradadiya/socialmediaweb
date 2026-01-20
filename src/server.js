// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db.js");
// const PORT = process.env.PORT || 3001;
// dotenv.config();
// const path = require("path");

// const { Server } = require('socket.io');
// const io = new Server(server);
// connectDB();

// const app = express();
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.use(express.static(path.join(__dirname, "../public")));

// app.use("/api/auth", require("./routes/authRoutes.js"));

// app.use("/api/content", require("./routes/contentRoutes.js"));

// app.use("/api/music", require("./routes/musicRoutes.js"));

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// io.on('connection', (socket) => {
//   console.log('a user connected');
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const PORT = process.env.PORT || 3001;

connectDB();

// APP
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ROUTES
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/content", require("./routes/contentRoutes.js"));
app.use("/api/music", require("./routes/musicRoutes.js"));
app.use("/api/message", require("./routes/messageRoutes.js"));
app.use("/api/conversation", require("./routes/conversationRoutes.js"));
app.use("/api/req", require("./routes/followRoutes.js"));
app.use("/api/req", require("./routes/blockRoutes.js"));
app.use("api/apply", require("./routes/likesharecommentRoutes.js"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
