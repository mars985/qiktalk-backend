const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const cookie = require("cookie");
const { ApiError } = require("../utils/ApiError");

async function verifyUserFromToken(token) {
  if (!token) throw new ApiError(400, "No token provided");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(400, "Invalid or expired token");
  }

  const loggedInUser = await User.findById(decoded._id);
  if (!loggedInUser) throw new ApiError(400, "User not found");

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

async function socketAuth(io) {
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
      next(new ApiError(400, "Unauthorized: " + err.message));
    }
  });
}

module.exports = { authenticate, socketAuth };
