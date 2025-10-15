const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

async function createUser({ username, email, password }) {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new Error("User already exists");

  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new Error("Username taken");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const createdUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  return { user: createdUser, token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Invalid password");

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  const userWithoutPassword = {
    _id: user._id,
    email: user.email,
    name: user.username,
  };

  return { user: userWithoutPassword, token };
}

async function updateUser({ username, email, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const updatedUser = await User.findOneAndUpdate(
    { username, email },
    { password: hashedPassword },
    { new: true }
  );

  if (!updatedUser) throw new Error("User not found");
  return updatedUser;
}

async function searchUsernames({ searchString, loggedInUserId }) {
  return User.find({
    username: { $regex: searchString, $options: "i" },
    _id: { $ne: loggedInUserId },
  }).select("username");
}

async function setOnline({ userId }) {
  await User.findByIdAndUpdate(userId, { lastseen: new Date(0) });
}

async function setOffline({ userId }) {
  await User.findByIdAndUpdate(userId, { lastseen: new Date() });
}

async function getOnlineStatus({ userId }) {
  const user = await User.findById(userId);
  return user ? (user.lastseen ? user.lastseen : "unknown") : null;
}

module.exports = {
  createUser,
  loginUser,
  updateUser,
  searchUsernames,
  setOnline,
  setOffline,
  getOnlineStatus,
};
