const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  body: String,
});

module.exports = mongoose.model("message", messageSchema);
