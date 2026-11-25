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

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.avatarPublicId;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("user", userSchema);
