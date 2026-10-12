const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  lastseen: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("user", userSchema);
