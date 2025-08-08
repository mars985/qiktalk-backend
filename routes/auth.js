const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

module.exports = async function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Not logged in");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");

    const loggedInUser = await User.findOne({ email: decoded.email });

    if (!loggedInUser) {
      res.clearCookie("token");
      return res.status(401).send("User not found");
    }

    req.user = loggedInUser;
    next();
  } catch (err) {
    res.clearCookie("token");
    res.status(401).send("Invalid token");
  }
};
