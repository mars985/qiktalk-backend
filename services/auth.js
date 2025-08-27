const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const cookie = require("cookie");

async function verifyUserFromToken(token) {
  if (!token) throw new Error("No token provided");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }

  const loggedInUser = await User.findOne({ email: decoded.email });
  if (!loggedInUser) throw new Error("User not found");

  return loggedInUser;
}

async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token;
    req.user = await verifyUserFromToken(token);
    next();
  } catch (err) {
    res.clearCookie("token");
    res.status(401).send(err.message || "Unauthorized");
  }
}

function socketAuth(io) {
  io.use(async (socket, next) => {
    try {
      // Prefer handshake.auth.token (explicit from client)
      let token = socket.handshake.auth?.token;

      // Fallback to cookie
      if (!token && socket.handshake.headers?.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.token;
      }

      socket.user = await verifyUserFromToken(token);
      next();
    } catch (err) {
      next(new Error("Unauthorized: " + err.message));
    }
  });
}

module.exports = {authenticate, socketAuth};
