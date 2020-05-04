const express = require("express");
const router = express.Router();

const { createOne } = require("../controllers/user.controller");

router.post("/register", createOne);

module.exports = router;
