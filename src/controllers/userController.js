const userService = require("../services/userServices");
const { asyncHandler } = require("../utils/AsyncHandler");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const { user, token } = await userService.createUser({
    username,
    email,
    password,
  });

  res.cookie("token", token, { httpOnly: true });
  res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await userService.loginUser({
    email,
    password,
  });

  res.cookie("token", token, { httpOnly: true });

  res
    .status(200)
    .json(new ApiResponse(200, user, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const verify = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User verified"));
});

const update = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const updatedUser = await userService.updateUser({
    username,
    email,
    password,
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const search = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;
  const searchString = req.query.searchString || "";

  const users = await userService.searchUsernames({
    searchString,
    loggedInUserId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, users));
});

const getOnlineStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const status = await userService.getPresence({ userId });

  if (!status) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, status));
});

module.exports = {
  register,
  login,
  logout,
  verify,
  update,
  search,
  getOnlineStatus,
};
