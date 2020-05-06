const jwt = require("jsonwebtoken");
const { getSecret } = require("../utils/jwt");
const wrapAsync = require("../utils/wrapAsync");

const protectRoute = wrapAsync((req, res, next) => {
  const token = req.signedCookies[process.env.COOKIE_NAME];

  const notAuthorisedError = new Error("You are not authorized");
  notAuthorisedError.statusCode = 401;

  if (!token) {
    throw notAuthorisedError;
  }

  try {
    req.user = jwt.verify(token, getSecret());
  } catch (err) {
    throw notAuthorisedError;
  }

  next();
});

module.exports = { protectRoute };
