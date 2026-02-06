const Team = require("../models/team.model");

const createTeam = async (req, res) => {
  try {
    const newTeam = new Team(req.body);
    const savedNewTeam = await newTeam.save();

    return res.status(201).json({
      message: "New Team created successfully.",
      data: savedNewTeam,
    });
  } catch (error) {
    console.error("POST /api/teams failed:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .josn({ message: "Invalid team data", errors: error.errors });
    }

    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().lean();
    if (!teams.length) {
      return res.status(404).json({ message: "No Teams Found." });
    }
    return res.status(200).json({ data: teams });
  } catch (error) {
    console.error("GET /api/teams failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createTeam, getTeams };
