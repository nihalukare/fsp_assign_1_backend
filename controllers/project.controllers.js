const Project = require("../models/project.model");

const createProject = async (req, res) => {
  try {
    const newProject = new Project(req.body);
    const savedNewProject = await newProject.save();

    return res.status(201).json({
      message: "New project created successfully.",
      data: savedNewProject,
    });
  } catch (error) {
    console.error("POST /api/projects failed:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid project data", errors: error.errors });
    }

    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().lean();

    if (!projects.length) {
      return res.status(404).json({ message: "No Projects Found." });
    }

    return res.status(200).json({ data: projects });
  } catch (error) {
    console.error("GET /api/projects failed:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createProject, getProjects };
