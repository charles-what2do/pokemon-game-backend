const express = require("express");
const cors = require("cors");
const cookierParser = require("cookie-parser");
const app = express();
require("./utils/db");

var corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookierParser(process.env.COOKIE_SECRET_KEY));

const userRouter = require("./routes/user.route");
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.json({
    "0": "GET /",
    "1": "GET /user",
    "2": "POST /user/register",
    "3": "POST /user/login",
    "4": "POST /user/logout",
  });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  const message = err.message || "Internal server error";
  if (app.get("env") === "development" || app.get("env") === "test") {
    console.log(err);
  }
  res.send({ error: `${message}` });
});

module.exports = app;
