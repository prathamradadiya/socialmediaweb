const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const PORT = process.env.PORT || 3001;
dotenv.config();
const path = require("path");
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));


app.use("/api/auth",  require("./routes/authRoutes.js"));

app.use("/api/content", require("./routes/contentRoutes.js"));

app.use("/api/music", require("./routes/musicRoutes.js"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
