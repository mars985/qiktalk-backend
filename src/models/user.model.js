const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  avatar: {
    type: String,
    default: null,
  },
  avatarPublicId: {
    type: String,
    default: null,
  },
  lastseen: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("user", userSchema);
