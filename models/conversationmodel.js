const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/QikTalk`);

const conversationSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
  id: { type: String, unique: true, default: _id },
  groupName: { type: String, default: null },
  createdAt: { type: Date, default: null },
});

conversationSchema.pre("save", function (next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

module.exports = mongoose.model("conversation", conversationSchema);
