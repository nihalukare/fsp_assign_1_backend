const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();
const express = require("express");
const app = express();

const { connectDB } = require("./db/db.connect");

const { verifyJWT } = require("./middlewares/verifyJWT");

const User = require("./models/user.model");
const Task = require("./models/task.model");
const Team = require("./models/team.model");
const Project = require("./models/project.model");
const { default: mongoose } = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const createNewUser = async (newUserData) => {
  const { name, email, password } = newUserData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword });
  const savedNewUser = await newUser.save();

  return {
    id: savedNewUser._id.toString(),
    name: savedNewUser.name,
    email: savedNewUser.email,
  };
};

// SignUp Auth
app.post("/api/auth/signup", async (req, res) => {
  try {
    const savedNewUser = await createNewUser(req.body);

    if (savedNewUser) {
      return res.status(201).json({
        message: "New user created successfully.",
        savedNewUser,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: `User with email ${error.keyValue.email} already exists.`,
      });
    }
    console.error("POST /api/auth/signup failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login Auth
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(404)
        .json({ message: "No user found with this email address." });
      return;
    }
    const isPasswordVaild = await bcrypt.compare(password, user.password);
    if (!isPasswordVaild) {
      res.status(401).json({ message: "Wrong Password." });
      return;
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
    return res.status(200).json({ message: "Credentials Vaild!", token });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});

app.get("/api/auth/me", verifyJWT, async (req, res) => {
  try {
    const { email } = req.user;
    const userDetails = await User.findOne({ email });

    res.status(200).json({ name: userDetails.name, email: userDetails.email });
  } catch (error) {
    console.error("GET /api/auth/me failed:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Function to create a new Task
const createNewTask = async (task) => {
  const newTask = new Task(task);
  const savedNewTask = await newTask.save();

  return {
    id: savedNewTask._id,
    name: savedNewTask.name,
    project: savedNewTask.project,
    team: savedNewTask.team,
    owners: savedNewTask.owners,
    tags: savedNewTask.tags,
    timeToComplete: savedNewTask.timeToComplete,
    status: savedNewTask.status,
  };
};
// API to create a new Task
app.post("/api/tasks", verifyJWT, async (req, res) => {
  try {
    const newTask = await createNewTask(req.body);
    if (newTask) {
      res
        .status(201)
        .json({ message: "New task created successfully.", data: newTask });
      return;
    }
  } catch (error) {
    console.error("POST /api/tasks failed:", error);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
});

// Function to create a new Team
const createNewTeam = async (team) => {
  const newTeam = new Team(team);
  const savedNewTeam = await newTeam.save();

  return {
    id: savedNewTeam._id,
    name: savedNewTeam.name,
    description: savedNewTeam.description,
  };
};
// API to add new Team
app.post("/api/teams", verifyJWT, async (req, res) => {
  try {
    const newTeam = await createNewTeam(req.body);
    return res.status(201).json({
      message: "New Team created successfully.",
      data: newTeam,
    });
  } catch (error) {
    console.error("POST /api/teams failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

// Function to create new Project
const createNewProject = async (project) => {
  const newProject = new Project(project);
  const savedNewProject = await newProject.save();

  return {
    id: savedNewProject._id,
    name: savedNewProject.name,
    description: savedNewProject.description,
  };
};
// API to add a new Project
app.post("/api/projects", verifyJWT, async (req, res) => {
  try {
    const newProject = await createNewProject(req.body);
    return res
      .status(201)
      .json({ message: "New project created successfully.", data: newProject });
  } catch (error) {
    console.error("POST /api/projects failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Function to Read all tasks
const getTasks = async () => {
  const tasks = await Task.find()
    .populate("project team owners")
    .select("-__v")
    .lean();

  return tasks.map((task) => ({
    id: String(task._id),
    name: task.name,
    project: task.project.name,
    team: task.team.name,
    owners: task.owners.map((owner) => owner.name),
    tags: task.tags,
    timeToComplete: task.timeToComplete,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));
};
// API to fetch all tasks
app.get("/api/tasks", verifyJWT, async (req, res) => {
  try {
    const tasks = await getTasks();
    return res.status(200).json({ data: tasks });
  } catch (error) {
    console.error("GET /api/tasks failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Function to read all teams
const getTeams = async () => {
  const teams = await Team.find().select("-__v").lean();
  return teams;
};
// API to fetch all teams
app.get("/api/teams", verifyJWT, async (req, res) => {
  try {
    const teams = await getTeams();
    if (!teams.length) {
      return res.status(404).json({ message: "No Teams Found." });
    }
    return res.status(200).json({ data: teams });
  } catch (error) {
    console.error("GET /api/teams failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Function to read all projects
const getProjects = async () => {
  const projects = await Project.find().select("-__v").lean();
  return projects;
};
// API to fetch all projects
app.get("/api/projects", verifyJWT, async (req, res) => {
  try {
    const projects = await getProjects();
    if (!projects.length) {
      return res.status(404).json({ message: "No Projects Found." });
    }
    return res.status(200).json({ data: projects });
  } catch (error) {
    console.error("GET /api/projects failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Function to update a task
const updateTask = async (taskId, taskData) => {
  const updated = await Task.findByIdAndUpdate(taskId, taskData, {
    new: true,
  })
    .populate("project team owners")
    .select("-__v")
    .lean();

  if (!updated) return null;

  return {
    id: String(updated._id),
    name: updated.name,
    project: updated.project.name,
    team: updated.team.name,
    owners: updated.owners.map((owner) => owner.name),
    tags: updated.tags,
    timeToComplete: updated.timeToComplete,
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};
// API to update a task
app.put("/api/tasks/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id))
    return res.status(400).json({ message: "Invalid task id." });

  try {
    const updated = await updateTask(id, req.body);

    if (!updated) {
      return res.status(404).json({
        message: "Task not found. Failed to update task.",
      });
    }

    return res
      .status(200)
      .json({ message: "Task updated successfully.", data: updated });
  } catch (error) {
    console.error("PUT /api/tasks/:id failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

// API to delete a task
app.delete("/api/tasks/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id))
    return res.status(400).json({ message: "Invalid task id." });

  try {
    const deletedTask = await Task.findByIdAndDelete({ _id: id });

    if (!deletedTask)
      return res
        .status(404)
        .json({ message: "Task not found. Failed to delete task." });

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/tasks/:id failed:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT", PORT);
  });
});
