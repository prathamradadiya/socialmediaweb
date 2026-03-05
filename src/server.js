const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const path = require("path");
const cookieParser = require("cookie-parser");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const http = require("http");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

const { handleWebhook } = require("./controllers/subscription.controller");

app.post(
  "/api/subscription/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

/* ======================================================
   GLOBAL MIDDLEWARES
   ====================================================== */

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Cookies
app.use(cookieParser());

// JSON parsers (AFTER webhook only)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

/* ======================================================
   ROUTES
   ====================================================== */

app.use("/api/subscription", require("./routes/subscription.Routes.js"));
app.use("/api/auth", require("./routes/auth.Routes.js"));
app.use("/api/content", require("./routes/content.Routes.js"));
app.use("/api/music", require("./routes/music.Routes.js"));
app.use("/api/follow", require("./routes/follow.Routes.js"));
app.use("/api/block", require("./routes/block.Routes.js"));
app.use("/api/post", require("./routes/post.Routes.js"));
app.use("/api/chat", require("./routes/message.Routes.js"));

/* ======================================================
   FILE UPLOAD (LAST — prevents webhook corruption)
   ====================================================== */
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }),
);

/* ======================================================
   SUCCESS / CANCEL (Stripe redirects)
   ====================================================== */
app.get("/api/subscription/success", (req, res) => {
  res.json({
    success: true,
    message: "Payment completed. Subscription activating...",
  });
});

app.get("/api/subscription/cancel", (req, res) => {
  res.json({
    success: false,
    message: "Payment cancelled",
  });
});

/* ======================================================
   HEALTH CHECK (nice for testing / uptime monitors)
   ====================================================== */
app.get("/health", (req, res) => {
  res.send("OK");
});

/* ======================================================
   GLOBAL ERROR HANDLER
   ====================================================== */
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ======================================================
   SERVER
   ====================================================== */

const server = http.createServer(app);

cloudinaryConnect();
require("./utils/socket.js")(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
