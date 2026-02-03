const mongoose = require("mongoose");

// Team Schema
const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["user", "admin"], default: "member" },
      },
    ],
    description: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Team", teamSchema);
