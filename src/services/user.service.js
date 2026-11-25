const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const presence = require("./presence.service");
const { ApiError } = require("../utils/ApiError");
const {
  uploadOnCloudinary,
  destroyOnCloudinary,
} = require("./cloudinary.service");
const { TOKEN_EXPIRY_TIME } = require("../constants/cookie.constants");

function createToken({ _id }) {
  return jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY_TIME,
  });
}

async function createUser({ username, email, password }) {
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

  const token = createToken({ _id: createdUser._id });

  return { user: createdUser, token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = createToken({ _id: user._id });

  return { user, token };
}

async function updateUser({ username, email, password }) {
  if (!username || !email || !password) {
    throw new ApiError(400, "Required fields missing");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await User.findOneAndUpdate(
    { username, email },
    { password: hashedPassword },
    { new: true },
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return updatedUser;
}

async function searchUsernames({ searchString, loggedInUserId }) {
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
    { new: true },
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

async function uploadAvatar({ user, file }) {
  if (!file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const uploaded = await uploadOnCloudinary(file.path);

  if (!uploaded) {
    throw new ApiError(502, "Failed to upload avatar");
  }

  const oldPublicId = user.avatarPublicId;

  try {
    user.avatar = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
    await user.save();
  } catch (error) {
    await destroyOnCloudinary({ public_id: uploaded.public_id });
    throw error;
  }

  if (oldPublicId) {
    await destroyOnCloudinary({ public_id: oldPublicId });
  }

  return user.avatar;
}

module.exports = {
  createUser,
  loginUser,
  updateUser,
  searchUsernames,
  setLastSeen,
  getPresence,
  uploadAvatar,
};
