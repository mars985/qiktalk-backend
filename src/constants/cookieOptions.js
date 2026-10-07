const AUTH_COOKIE_NAME = "token";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const TOKEN_EXPIRY_TIME = "2d";

module.exports = { AUTH_COOKIE_NAME, authCookieOptions, TOKEN_EXPIRY_TIME };