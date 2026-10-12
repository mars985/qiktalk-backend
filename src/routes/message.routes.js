const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");
const messageController = require("../controllers/message.controller");
const { validate } = require("../middlewares/validate.middleware");
const messageValidator = require("../validators/message.validator");

router.get(
    "/messages/:conversationId",
    authenticate,
    validate(messageValidator.getMessagesSchema, "params"),
    messageController.getMessages
);

router.post(
    "/sendMessage",
    authenticate,
    validate(messageValidator.sendMessageSchema),
    messageController.sendMessage
);

module.exports = router;