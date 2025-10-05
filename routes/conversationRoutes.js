const express = require("express");
const router = express.Router();

const { authenticate } = require("../services/auth");
const conversationController = require("../controllers/conversationController");

router.post("/createDM", authenticate, conversationController.createDM);
router.post("/createGroup", authenticate, conversationController.createGroup);
router.post("/addToGroup", authenticate, conversationController.addToGroup);
router.get("/getConversations", authenticate, conversationController.getConversations);
router.get("/:conversationId/user", authenticate, conversationController.getConversationUsers);
router.get("/:conversationId", authenticate, conversationController.getConversationById);

module.exports = router;
