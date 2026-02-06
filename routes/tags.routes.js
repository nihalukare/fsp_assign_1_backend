const express = require("express");
const { verifyJWT } = require("../middlewares/verifyJWT");
const { createTag, getTags } = require("../controllers/tag.controllers");

const router = express.Router();

// API to add new tags
router.post("/", verifyJWT, createTag);

// API to fetch all tags
router.get("/", verifyJWT, getTags);

module.exports = router;
