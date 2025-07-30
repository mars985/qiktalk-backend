const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/QikTalk`);

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  body: String,
});

module.exports = mongoose.model("message", messageSchema);
