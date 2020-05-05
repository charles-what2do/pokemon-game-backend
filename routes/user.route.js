const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth");

const {
  createOne,
  setToken,
  setCookie,
  respondLoggedIn,
  clearCookie,
  respondLoggedOut,
  findTokenUser,
  findTokenUserRecords,
  addRecord,
} = require("../controllers/user.controller");

router.post("/register", createOne);

router.post("/login", setToken, setCookie, respondLoggedIn);

router.post("/logout", clearCookie, respondLoggedOut);

router.get("/", protectRoute, findTokenUser);

router.get("/records", protectRoute, findTokenUserRecords);

router.post("/records", protectRoute, addRecord);

module.exports = router;
