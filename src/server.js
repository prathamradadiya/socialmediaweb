const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const path = require("path");
const cookieParser = require("cookie-parser");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const http = require("http");

dotenv.config();
connectDB();

const app = express();

// ===== MIDDLEWARE FIRST =====
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
  }),
);

// ===== ROUTES =====
app.use("/api/auth", require("./routes/auth.Routes.js"));
app.use("/api/content", require("./routes/content.Routes.js"));
app.use("/api/music", require("./routes/music.Routes.js"));
app.use("/api/follow", require("./routes/follow.Routes.js"));
app.use("/api/block", require("./routes/block.Routes.js"));
app.use("/api/post", require("./routes/post.Routes.js"));
app.use("/api/chat", require("./routes/message.Routes.js"));

app.get("/", (req, res) => res.send("Hello World!"));

// ===== SERVER =====
const server = http.createServer(app);

cloudinaryConnect();
require("./utils/socket.js")(server);

server.listen(process.env.PORT || 3001, () => console.log(`Server running`));
