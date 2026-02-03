const mongoose = require("mongoose");

const statusHistory = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StatusHistory", statusHistory);
