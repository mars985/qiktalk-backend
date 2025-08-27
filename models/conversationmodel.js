const mongoose = require("mongoose");

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

// TODO: add createdAt for groups
