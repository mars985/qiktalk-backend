const z = require("zod");
const { mongoIdSchema } = require("./common");
const { minLengthMessage, maxLengthMessage } = require("./messages");
const { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } = require("../constants/message.constants");

const sendMessageSchema = z.object({
    message: z
        .string()
        .trim()
        .min(MIN_MESSAGE_LENGTH, minLengthMessage("Message", MIN_MESSAGE_LENGTH))
        .max(MAX_MESSAGE_LENGTH, maxLengthMessage("Message", MAX_MESSAGE_LENGTH))
});

const sendMessageSocketSchema = sendMessageSchema.extend({
    conversationId: mongoIdSchema
});

module.exports = {
    sendMessageSchema,
    sendMessageSocketSchema
}
