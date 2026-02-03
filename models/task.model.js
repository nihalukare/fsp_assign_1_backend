const mongoose = require("mongoose");

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    primaryOwner: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    tags: [{ type: String, trim: true, lowercase: true }],

    estimatedTime: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ["hours", "days"], required: true },
    },

    dueDate: { type: Date, index: true },

    status: {
      type: String,
      default: "todo",
      index: true,
    },

    statusHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StatusHistory",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },

  { timestamps: true },
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ primaryOwner: 1 });

module.exports = mongoose.model("Task", taskSchema);
