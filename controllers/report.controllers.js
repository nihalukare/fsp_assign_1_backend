const Task = require("../models/task.model");

const getTasksCompletedLastWeek = async (req, res) => {
  try {
    const dateSevenDaysAgo = new Date();
    dateSevenDaysAgo.setDate(dateSevenDaysAgo.getDate() - 7);
    dateSevenDaysAgo.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      status: "Completed",
      updatedAt: { $gte: dateSevenDaysAgo },
    }).lean();

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("GET /api/report/last-week failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: { $ne: "Completed" } }).lean();
    const totalDays = tasks.reduce((acc, task) => acc + task.timeToComplete, 0);

    return res.status(200).json({ totalDays });
  } catch (error) {
    console.error("GET /api/report/pending failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// Function to get number of tasks closed
const getClosedTasks = async (groupBy) => {
  const tasks = await Task.find({ status: "Completed" }).select(`-__v`).lean();
  const distinctIds = await Task.distinct(groupBy);

  const tasksGroupedBy = distinctIds.map((id) => {
    const filteredTasks = tasks.filter(
      (task) => task[groupBy].toString() === id.toString(),
    );

    return {
      [`${groupBy}Id`]: id,
      count: filteredTasks.length,
      tasks: filteredTasks.map((task) => ({
        taskId: task._id,
        name: task.name,
      })),
    };
  });

  return tasksGroupedBy;
};
const getClosedTasksReport = async (req, res) => {
  const { groupBy } = req.query;
  const VALID_GROUPS = ["team", "project", "owners"];
  try {
    if (!VALID_GROUPS.includes(groupBy))
      return res.status(400).json({ message: "Invalid Query Params." });

    const tasks = await getClosedTasks(groupBy);

    return res.status(200).json({ groupBy, results: tasks });
  } catch (error) {
    console.error("GET /api/report/closed-tasks failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  getTasksCompletedLastWeek,
  getPendingTasks,
  getClosedTasksReport,
};
