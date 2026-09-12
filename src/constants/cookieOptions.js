const AUTH_COOKIE_NAME = "token";

const authCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  partitioned: true,
};

const TOKEN_EXPIRY_TIME = "2d";

module.exports = { AUTH_COOKIE_NAME, authCookieOptions, TOKEN_EXPIRY_TIME };