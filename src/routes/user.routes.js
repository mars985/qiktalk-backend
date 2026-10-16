const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const userController = require("../controllers/user.controller");
const userValidator = require("../validators/user.validator");

router.post(
  "/register",
  validate(userValidator.registerSchema),
  userController.register,
);

router.post(
  "/login",
  validate(userValidator.loginSchema),
  userController.login,
);

router.post("/logout", authenticate, userController.logout);

router.get("/verify", authenticate, userController.verify);

router.post("/updateUser", authenticate, userController.update);

router.get(
  "/searchUsernames",
  authenticate,
  validate(userValidator.searchUsernamesSchema, "query"),
  userController.search,
);

router.get(
  "/getOnlineStatus/:userId",
  authenticate,
  validate(userValidator.getOnlineStatusSchema, "params"),
  userController.getOnlineStatus,
);

module.exports = router;
