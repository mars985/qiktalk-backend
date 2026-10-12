const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");
const conversationController = require("../controllers/conversation.controller");
const conversationValidator = require("../validators/conversation.validator");
const { validate } = require("../middlewares/validate.middleware");

router.post(
    "/createDM",
    authenticate,
    validate(conversationValidator.createDMSchema),
    conversationController.createDM
);

router.post(
    "/createGroup",
    authenticate,
    validate(conversationValidator.createGroupSchema),
    conversationController.createGroup
);

router.post(
    "/addToGroup",
    authenticate,
    validate(conversationValidator.addToGroupSchema),
    conversationController.addToGroup
);

router.get(
    "/getConversations",
    authenticate,
    conversationController.getConversations
);

router.get(
    "/:conversationId/user",
    authenticate,
    validate(conversationValidator.getConversationUsersSchema, "params"),
    conversationController.getConversationUsers
);

router.get(
    "/:conversationId",
    authenticate,
    validate(conversationValidator.getConversationByIdSchema, "params"),
    conversationController.getConversationById
);

module.exports = router;
