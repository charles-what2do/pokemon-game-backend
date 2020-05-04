const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    "0": "GET /",
    "1": "GET /user",
    "2": "POST /user/register",
    "3": "POST /user/login",
    "4": "POST /user/logout",
  });
});

app.use((err, req, res) => {
  res.status(err.statusCode || 500);
  const message = err.message || "Internal server error";
  if (app.get("env") === "development" || app.get("env") === "test") {
    console.log(err);
  }
  res.send({ error: `${message}` });
});

module.exports = app;
