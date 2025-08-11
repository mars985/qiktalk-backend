const express = require("express");
const router = express.Router();

const { authenticate } = require("../services/auth");
const userController = require("../controllers/userController");

router.post("/createUser", userController.register);
router.post("/login", userController.login);
router.get("/logout", authenticate, userController.logout);
router.get("/verify", authenticate, userController.verify);
router.post("/updateUser", authenticate, userController.update);
router.get("/searchUsernames", authenticate, userController.search);

module.exports = router;
