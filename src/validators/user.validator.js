const z = require("zod");
const { mongoIdSchema } = require("./common");
const {
    MIN_USERNAME_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_SEARCH_STRING_LENGTH,
    MAX_SEARCH_STRING_LENGTH
} = require("../constants/user.constants");

const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
        .max(MAX_USERNAME_LENGTH, `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`),

    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        .max(MAX_PASSWORD_LENGTH, `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`),
});

const loginSchema = z.object({
    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        .max(MAX_PASSWORD_LENGTH, `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`),
});

const searchUsernamesSchema = z.object({
    searchString: z
        .string()
        .trim()
        .min(MIN_SEARCH_STRING_LENGTH, `Search string must be at least ${MIN_SEARCH_STRING_LENGTH} characters`)
        .max(MAX_SEARCH_STRING_LENGTH, `Search string cannot exceed ${MAX_SEARCH_STRING_LENGTH} characters`),
});

const getOnlineStatusSchema = z.object({
    userId: mongoIdSchema
});

module.exports = {
    registerSchema,
    loginSchema,
    searchUsernamesSchema,
    getOnlineStatusSchema
};