const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const userController = require("../controllers/userController");
const userValidator = require("../validators/userValidator");

router.post(
    "/createUser",
    validate(userValidator.registerSchema),
    userController.register
);

router.post(
    "/login",
    validate(userValidator.loginSchema),
    userController.login
);

router.get("/logout", authenticate, userController.logout);
router.get("/verify", authenticate, userController.verify);
router.post("/updateUser", authenticate, userController.update);

router.get(
    "/searchUsernames", 
    authenticate,
    validate(userValidator.searchUsernamesSchema, "query"),
    userController.search
);

router.get(
    "/getOnlineStatus/:userId", 
    authenticate, 
    validate(userValidator.getOnlineStatusSchema, "params"),
    userController.getOnlineStatus
);

module.exports = router;
