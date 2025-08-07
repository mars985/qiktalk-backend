const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/QikTalk`);

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["dm", "group"],
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
  groupName: { type: String, default: null },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model("conversation", conversationSchema);
