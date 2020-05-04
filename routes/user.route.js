const express = require("express");
const router = express.Router();

const {
  createOne,
  setToken,
  setCookie,
  respondLoggedIn,
} = require("../controllers/user.controller");

router.post("/register", createOne);

router.post("/login", setToken, setCookie, respondLoggedIn);

module.exports = router;
