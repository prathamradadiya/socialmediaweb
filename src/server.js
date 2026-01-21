const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const path = require("path");
const http = require("http");

dotenv.config();

const PORT = process.env.PORT || 3001;

connectDB();

// APP
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ROUTES
app.use("/api/auth", require("./routes/auth.Routes.js"));
app.use("/api/content", require("./routes/content.Routes.js"));
app.use("/api/music", require("./routes/music.Routes.js"));
app.use("/api/message", require("./routes/message.Routes.js"));
app.use("/api/conversation", require("./routes/conversation.Routes.js"));
app.use("/api/req", require("./routes/follow.Routes.js"));
app.use("/api/req", require("./routes/block.Routes.js"));
app.use("/api/post", require("./routes/likeRoutes.js"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// CREATE SERVER
const server = http.createServer(app);

// INITIALIZE SOCKET
require("./utils/socket.js")(server); // pass the HTTP server

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
