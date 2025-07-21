const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/QikTalk`);

const messageSchema = new mongoose.Schema({
  Id: String,
  sender: String,
  timestamp: String,
  body: String,
});

module.exports = mongoose.model("message", messageSchema);
