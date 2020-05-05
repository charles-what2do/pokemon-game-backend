const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const recordSchema = new Schema({
  _id: false,
  id: {
    type: String,
    required: true,
  },
  recordType: {
    type: String,
    required: true,
  },
  recordTime: {
    type: Number,
    required: true,
  },
});

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
    minlength: 3,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  records: [recordSchema],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const rounds = 10;
    this.password = await bcrypt.hash(this.password, rounds);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
