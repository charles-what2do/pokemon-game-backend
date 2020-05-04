const jwt = require("jsonwebtoken");

const getSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing secret to sign JWT token");
  }
  return secret;
};

const createJWTToken = (userid, username) => {
  const today = new Date();
  const exp = new Date(today);

  exp.setDate(today.getDate() + 30);

  const secret = getSecret();
  const payload = {
    userid: userid,
    username: username,
    exp: parseInt(exp.getTime() / 1000),
  };
  const token = jwt.sign(payload, secret);
  return token;
};

module.exports = { createJWTToken, getSecret };
