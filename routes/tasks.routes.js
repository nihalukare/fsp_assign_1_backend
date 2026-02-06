const express = require("express");
const { verifyJWT } = require("../middlewares/verifyJWT");
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  createTaskComment,
} = require("../controllers/task.controller");

const router = express.Router();

// API to create a new Task
router.post("/", verifyJWT, createTask);

// API to fetch all tasks
router.get("/", verifyJWT, getTasks);

// API to update a task
router.put("/:id", verifyJWT, updateTask);

// API to change status of a task
router.patch("/:id/status", verifyJWT, updateTaskStatus);

// Comments API
router.post("/:id/comments", verifyJWT, createTaskComment);

// API to delete a task
router.delete("/:id", verifyJWT, deleteTask);

module.exports = router;
