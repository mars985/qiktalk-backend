const z = require("zod");

const mongoIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

module.exports = {
    mongoIdSchema
};