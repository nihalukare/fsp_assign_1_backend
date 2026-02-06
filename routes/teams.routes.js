const express = require("express");
const { verifyJWT } = require("../middlewares/verifyJWT");
const { createTeam, getTeams } = require("../controllers/team.controllers");

const router = express.Router();

// API to add new Team
router.post("/", verifyJWT, createTeam);

// API to fetch all teams
router.get("/", verifyJWT, getTeams);

module.exports = router;
