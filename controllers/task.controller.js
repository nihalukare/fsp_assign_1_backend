const Task = require("../models/task.model");

// Get Tasks
const getTasks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sort = { createdAt: -1 };

  const {
    owner,
    team,
    project,
    tags,
    status,
    includeArchived = false,
  } = req.query;
  const filters = {};

  if (owner && mongoose.Types.ObjectId.isValid(owner))
    filters.$or = [{ primaryOwner: owner, collaborators: owner }];

  if (team && mongoose.Types.ObjectId.isValid(team))
    filters.team = mongoose.Types.ObjectId(team);

  if (project && mongoose.Types.ObjectId.isValid(project))
    filters.project = mongoose.Types.ObjectId(project);

  if (tags) filters.tags = { $in: tags.split(",") };

  if (status) filters.status = status;

  if (!includeArchived) filters.isArchived = false;

  try {
    const tasks = await Task.find(filters)
      .populate("project team primaryOwner collaborators")
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean();

    const totalCount = await Task.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / limit);

    return res
      .status(200)
      .json({ meta: { page, totalPages, totalCount }, data: tasks });
  } catch (error) {
    console.error("GET /api/tasks failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create Task
const createTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedNewTask = await newTask.save();

    res.status(201).json({
      message: "New task created successfully.",
      data: savedNewTask,
    });
  } catch (error) {
    console.error("POST /api/tasks failed:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid task data", errors: error.errors });
    }

    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

// Update Task
const updateTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid task id." });

  try {
    const allowedUpdates = [
      "name",
      "tags",
      "estimatedTime",
      "dueDate",
      "collaborators",
    ];

    const updates = {};

    for (const key of allowedUpdates) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, isArchived: false },
      { $set: updates },
      { new: true },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found. Failed to update task.",
      });
    }

    return res
      .status(200)
      .json({ message: "Task updated successfully.", data: task });
  } catch (error) {
    console.error("PUT /api/tasks/:id failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });
  try {
    const task = await Task.findById(id);

    if (!task || task.isArchived)
      return res.status(404).json({ message: "Task not found." });

    task.status = status;
    task.statusHistory.push({
      status,
      changedBy: req.user.id,
    });

    await task.save();

    return res.status(200).json({
      message: "Task status updated",
      data: task,
    });
  } catch (error) {
    console.error("PATCH /status failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid task id." });

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found. Failed to delete task." });

    return res.status(200).json({ message: "Task archived successfully." });
  } catch (error) {
    console.error("DELETE /api/tasks/:id failed:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Create Comment
const createTaskComment = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message)
    return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const task = await Task.findById(id);

    if (!task || task.isArchived) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.comments.push({
      user: req.user.id,
      message,
    });

    await task.save();

    return res
      .status(201)
      .json({ message: "Comment added", data: task.comments.at(-1) });
  } catch (error) {
    console.error("POST /comments failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  createTaskComment,
};
