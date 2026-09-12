export const AUTH_COOKIE_NAME = "token";

export const authCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  partitioned: true,
};

export const TOKEN_EXPIRY_TIME = "2d";