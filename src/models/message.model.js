const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  body: { type: String, required: true },
  seen: {
    type: Map,
    of: Date,
    default: {},
  },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model("message", messageSchema);
