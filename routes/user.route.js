const express = require("express");
const router = express.Router();

const {
  createOne,
  setToken,
  setCookie,
  respondLoggedIn,
  clearCookie,
  respondLoggedOut,
} = require("../controllers/user.controller");

router.post("/register", createOne);

router.post("/login", setToken, setCookie, respondLoggedIn);

router.post("/logout", clearCookie, respondLoggedOut);

module.exports = router;
