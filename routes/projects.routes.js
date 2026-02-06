const express = require("express");
const { verifyJWT } = require("../middlewares/verifyJWT");
const {
  createProject,
  getProjects,
} = require("../controllers/project.controllers");

const router = express.Router();

// API to add a new Project
router.post("/", verifyJWT, createProject);

// API to fetch all projects
router.get("/", verifyJWT, getProjects);

module.exports = router;
