const z = require("zod");
const { mongoIdSchema } = require("./common");
const { minLengthMessage, maxLengthMessage } = require("./messages");
const { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } = require("../constants/message.constants");

const getMessagesSchema = z.object({
    conversationId: mongoIdSchema
});

const sendMessageSchema = z.object({
    message: z
        .string()
        .trim()
        .min(MIN_MESSAGE_LENGTH, minLengthMessage("Message", MIN_MESSAGE_LENGTH))
        .max(MAX_MESSAGE_LENGTH, maxLengthMessage("Message", MAX_MESSAGE_LENGTH)),

    conversationId: mongoIdSchema
});

module.exports = {
    getMessagesSchema,
    sendMessageSchema
}
