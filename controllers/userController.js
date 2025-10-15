const userService = require("../services/userServices");

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const { user, token } = await userService.createUser({
      username,
      email,
      password,
    });

    res.cookie("token", token, { httpOnly: true });
    res
      .status(201)
      .json({ success: true, message: "User created", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser({ email, password });

    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true, message: "Login successful", data: user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}

async function logout(req, res) {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
}

async function verify(req, res) {
  res.json({ success: true, verified: true, user: req.user });
}

async function update(req, res) {
  try {
    const { username, email, password } = req.body;
    const updatedUser = await userService.updateUser({
      username,
      email,
      password,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function search(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const searchString = req.query.searchString || "";
    const users = await userService.searchUsernames({
      searchString,
      loggedInUserId,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getOnlineStatus(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const status = await userService.getOnlineStatus({ userId });

    if (!status) {
      return res
        .status(404)
        .json({ success: false, message: "Status undefined" });
    }

    res.json({ success: true, data: status });
  } catch (error) {
    console.error("Error fetching online status:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  register,
  login,
  logout,
  verify,
  update,
  search,
  getOnlineStatus
};
