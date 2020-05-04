const express = require("express");
const Joi = require("@hapi/joi");
const User = require("../models/user.model");
const { v4: uuid } = require("uuid");
const wrapAsync = require("../utils/wrapAsync");
const bcrypt = require("bcryptjs");
const { createJWTToken } = require("../utils/jwt");

const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(8).required(),
});

const createOne = wrapAsync(async (req, res, next) => {
  const submittedUser = req.body;
  const result = userSchema.validate(submittedUser);

  if (result.error) {
    const invalidInputsError = new Error("Invalid inputs");
    invalidInputsError.statusCode = 400;
    throw invalidInputsError;
  }
  const user = new User(submittedUser);
  user.id = uuid();
  const newUser = await user.save();
  res.send(newUser);
});

const respondLoggedIn = (req, res) => {
  res.send("You are logged in");
};

const setToken = wrapAsync(async (req, res, next) => {
  const loginDetails = req.body;
  const { username, password } = loginDetails;
  const foundUser = await User.findOne({ username: username });

  if (!foundUser) {
    const noUserError = new Error("No such user");
    noUserError.statusCode = 404;
    throw noUserError;
  }

  const result = await bcrypt.compare(password, foundUser.password);
  if (!result) {
    const wrongPasswordError = new Error("Wrong password");
    wrongPasswordError.statusCode = 400;
    throw wrongPasswordError;
  }

  req.token = createJWTToken(foundUser.id, username);
  next();
});

const setCookie = (req, res, next) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = oneDay * 7;
  const expiryDate = new Date(Date.now() + oneWeek);

  const cookieName = "token";
  const token = req.token;

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    res.cookie(cookieName, token, {
      expires: expiryDate,
      httpOnly: true,
      signed: true,
    });
  } else {
    res.cookie(cookieName, token, {
      expires: expiryDate,
      httpOnly: true,
      secure: true,
      signed: true,
    });
  }
  next();
};

const clearCookie = (req, res, next) => {
  res.clearCookie("token");
  next();
};

const respondLoggedOut = (req, res) => {
  res.send("You have been logged out");
};

const findTokenUser = wrapAsync(async (req, res, next) => {
  const user = await User.findOne({ id: req.user.userid });
  if (!user) {
    const noUserError = new Error("No such user");
    noUserError.statusCode = 404;
    throw noUserError;
  }

  const userObject = user.toObject();
  const { _id, __v, password, ...strippedUser } = userObject;
  res.json(strippedUser);
});

module.exports = {
  createOne,
  respondLoggedIn,
  setToken,
  setCookie,
  clearCookie,
  respondLoggedOut,
  findTokenUser,
};
