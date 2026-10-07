const z = require("zod");

const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

const searchUsernames = z.object({
    searchString: z
        .string()
        .trim()
        .min(3, "Search string must be at least 3 characters")
        .max(50, "Search string cannot exceed 50 characters"),
});

module.exports = {
    registerSchema,
    loginSchema,
    searchUsernames
};