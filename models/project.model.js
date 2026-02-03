const mongoose = require("mongoose");

// Project Schema
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed", "Blocked"],
      default: "To Do",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
