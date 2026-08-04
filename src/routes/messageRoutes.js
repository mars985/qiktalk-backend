const express = require("express");
const router = express.Router();

const { authenticate } = require("../services/auth");
const messageController = require("../controllers/messageController");

router.get("/messages/:conversationId", authenticate, messageController.getMessages);
router.post("/sendMessage", authenticate, messageController.sendMessage);

module.exports = router;