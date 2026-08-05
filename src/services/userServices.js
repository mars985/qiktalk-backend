const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const presence = require("./presence");
const { ApiError } = require("../utils/ApiError");

async function createUser({ username, email, password }) {
  if (!username || !email || !password) {
    throw new ApiError(400, "Required fields missing");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(409, "User already exists");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(409, "Username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { _id: createdUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  return { user: createdUser, token };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, "Required fields missing");
  }
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  return {
    user: {
      _id: user._id,
      email: user.email,
      name: user.username,
    },
    token,
  };
}

async function updateUser({ username, email, password }) {
  if (!username || !email || !password) {
    throw new ApiError(400, "Required fields missing");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await User.findOneAndUpdate(
    { username, email },
    { password: hashedPassword },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return updatedUser;
}

async function searchUsernames({ searchString, loggedInUserId }) {
  if (!searchString || searchString.length < 3)
    throw new ApiError(400, "Invalid search string");

  return User.find({
    username: { $regex: searchString, $options: "i" },
    _id: { $ne: loggedInUserId },
  }).select("username");
}

async function setLastSeen({ userId }) {
  const now = new Date();

  const user = await User.findByIdAndUpdate(
    userId,
    { lastseen: now },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return now;
}

async function getPresence({ userId }) {
  if (presence.isOnline(userId)) {
    return {
      online: true,
      lastSeen: null,
    };
  }

  const user = await User.findById(userId).select("lastseen");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    online: false,
    lastSeen: user.lastseen ?? null,
  };
}

module.exports = {
  createUser,
  loginUser,
  updateUser,
  searchUsernames,
  setLastSeen,
  getPresence,
};
