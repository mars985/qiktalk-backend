module.exports = function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Not logged in");
  }

  try {
    const user = jwt.verify(token, "secretkey");
    req.user = user; // You can now access req.user.email etc.
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
};