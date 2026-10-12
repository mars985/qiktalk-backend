const express = require("express");

const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");

const conversationController = require("../controllers/conversation.controller");
const conversationValidator = require("../validators/conversation.validator");

const messageController = require("../controllers/message.controller");
const messageValidator = require("../validators/message.validator");

const router = express.Router();
const conversationIdRoutes = express.Router({ mergeParams: true });
const messageRoutes = express.Router({ mergeParams: true });

// route => /conversations/

router.use(authenticate);

router.get(
    "/",
    conversationController.getConversations
);

router.post(
    "/createDM",
    validate(conversationValidator.createDMSchema, "body"),
    conversationController.createDM
);

router.post(
    "/createGroup",
    validate(conversationValidator.createGroupSchema, "body"),
    conversationController.createGroup
);

// route => /conversations/:conversationId/

conversationIdRoutes.use(
    validate(conversationValidator.conversationIdSchema, "params")
);

conversationIdRoutes.get(
    "/",
    conversationController.getConversationById
);

conversationIdRoutes.get(
    "/users",
    conversationController.getConversationUsers
);

conversationIdRoutes.post(
    "/addToGroup",
    validate(conversationValidator.addToGroupSchema, "body"),
    conversationController.addToGroup
);

// route => /conversations/:conversationId/messages/

messageRoutes.get(
    "/",
    messageController.getMessages
);

messageRoutes.post(
    "/send",
    validate(messageValidator.sendMessageSchema, "body"),
    messageController.sendMessage
);

conversationIdRoutes.use("/messages", messageRoutes);
router.use("/:conversationId", conversationIdRoutes);

module.exports = router;
