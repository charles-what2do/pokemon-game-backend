const express = require("express");
const Joi = require("@hapi/joi");
const User = require("../models/user.model");
const { v4: uuid } = require("uuid");
const wrapAsync = require("../utils/wrapAsync");

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

module.exports = {
  createOne,
};
