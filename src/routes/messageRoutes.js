const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth");
const messageController = require("../controllers/messageController");
const { validate } = require("../middlewares/validate");
const messageValidator = require("../validators/messageValidator");

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