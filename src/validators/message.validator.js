const z = require("zod");
const { mongoIdSchema } = require("./common");
const { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } = require("../constants/message.constants");

const getMessagesSchema = z.object({
    conversationId: mongoIdSchema
});

const sendMessageSchema = z.object({
    message: z
        .string()
        .trim()
        .min(MIN_MESSAGE_LENGTH, `Message must be at least ${MIN_MESSAGE_LENGTH} characters`)
        .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`),

    conversationId: mongoIdSchema
});

module.exports = {
    getMessagesSchema,
    sendMessageSchema
}
