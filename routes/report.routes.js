const express = require("express");
const { verifyJWT } = require("../middlewares/verifyJWT");

const {
  getTasksCompletedLastWeek,
  getPendingTasks,
  getClosedTasksReport,
} = require("../controllers/report.controllers");

const router = express.Router();

// API to fetch tasks completed last week
router.get("/tasks/completed-last-week", verifyJWT, getTasksCompletedLastWeek);

// API to fetch pending reports
router.get("/tasks/pending", verifyJWT, getPendingTasks);

// API to fetch number of tasks closed
router.get("/tasks/closed", verifyJWT, getClosedTasksReport);

module.exports = router;
