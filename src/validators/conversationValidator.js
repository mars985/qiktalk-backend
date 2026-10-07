const z = require("zod");
const { mongoIdSchema } = require("./common");
const {
    MIN_GROUP_NAME_LENGTH,
    MAX_GROUP_NAME_LENGTH,
    MIN_GROUP_PARTICIPANTS,
    MAX_GROUP_PARTICIPANTS
} = require("../constants/conversationConstants");

const createDMSchema = z.object({
    targetUserId: mongoIdSchema
});

const createGroupSchema = z
    .object({
        loggedInUserId: mongoIdSchema,

        participantIds: z.array(mongoIdSchema),

        groupName: z
            .string()
            .trim()
            .min(MIN_GROUP_NAME_LENGTH, `Group name must have at least ${MIN_GROUP_NAME_LENGTH} characters`)
            .max(MAX_GROUP_NAME_LENGTH, `Group name must not exceed ${MAX_GROUP_NAME_LENGTH} characters`)
    })
    .transform((data) => {
        const uniqueParticipants = Array.from(
            new Set([...data.participantIds, data.loggedInUserId])
        );

        return {
            ...data,
            participantIds: uniqueParticipants
        };
    })
    .refine(
        (data) => data.participantIds.length >= MIN_GROUP_PARTICIPANTS,
        {
            message: `A group must have at least ${MIN_GROUP_PARTICIPANTS} participants including yourself.`,
            path: ["participantIds"]
        }
    )
    .refine(
        (data) => data.participantIds.length <= MAX_GROUP_PARTICIPANTS,
        {
            message: `A group can have at most ${MAX_GROUP_PARTICIPANTS} participants including yourself.`,
            path: ["participantIds"]
        }
    );

const addToGroupSchema = z.object({
    participants: z
        .array(mongoIdSchema)
        .min(1, "You must add at least 1 participant to the group"),

    groupId: mongoIdSchema
});

const getConversationUsersSchema = z.object({
    conversationId: mongoIdSchema
});

const getConversationByIdSchema = z.object({
    conversationId: mongoIdSchema
});

module.exports = {
    createDMSchema,
    createGroupSchema,
    addToGroupSchema,
    getConversationUsersSchema,
    getConversationByIdSchema
};