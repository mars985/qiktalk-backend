const express = require("express");

const { authenticate } = require("../middlewares/auth.middleware");
const conversationController = require("../controllers/conversation.controller");
const conversationValidator = require("../validators/conversation.validator");
const { validate } = require("../middlewares/validate.middleware");

const router = express.Router();
const conversationIdRoutes = express.Router({ mergeParams: true });

// route => /conversations/

router.use(authenticate);

router.get(
    "/",
    conversationController.getConversations
);

router.post(
    "/createDM",
    validate(conversationValidator.createDMSchema),
    conversationController.createDM
);

router.post(
    "/createGroup",
    validate(conversationValidator.createGroupSchema),
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

router.use("/:conversationId", conversationIdRoutes);

module.exports = router;
