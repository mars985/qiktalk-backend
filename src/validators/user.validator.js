const z = require("zod");
const { mongoIdSchema } = require("./common");
const { minLengthMessage, maxLengthMessage } = require("./messages");
const {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_SEARCH_STRING_LENGTH,
  MAX_SEARCH_STRING_LENGTH,
} = require("../constants/user.constants");

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(MIN_USERNAME_LENGTH, minLengthMessage("Username", MIN_USERNAME_LENGTH))
    .max(
      MAX_USERNAME_LENGTH,
      maxLengthMessage("Username", MAX_USERNAME_LENGTH),
    ),

  email: z.email("Invalid email address").trim().toLowerCase(),

  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, minLengthMessage("Password", MIN_PASSWORD_LENGTH))
    .max(
      MAX_PASSWORD_LENGTH,
      maxLengthMessage("Password", MAX_PASSWORD_LENGTH),
    ),
});

const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),

  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, minLengthMessage("Password", MIN_PASSWORD_LENGTH))
    .max(
      MAX_PASSWORD_LENGTH,
      maxLengthMessage("Password", MAX_PASSWORD_LENGTH),
    ),
});

const searchUsernamesSchema = z.object({
  searchString: z
    .string()
    .trim()
    .min(
      MIN_SEARCH_STRING_LENGTH,
      minLengthMessage("Search string", MIN_SEARCH_STRING_LENGTH),
    )
    .max(
      MAX_SEARCH_STRING_LENGTH,
      maxLengthMessage("Search string", MAX_SEARCH_STRING_LENGTH),
    ),
});

const getOnlineStatusSchema = z.object({
  userId: mongoIdSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  searchUsernamesSchema,
  getOnlineStatusSchema,
};
