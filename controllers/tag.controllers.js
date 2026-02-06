const Tag = require("../models/tag.model");

const createTag = async (req, res) => {
  try {
    const newTag = new Tag(req.body);
    const savedNewTag = await newTag.save();

    return res
      .status(201)
      .json({ message: "New tag created successfully.", tag: savedNewTag });
  } catch (error) {
    console.error("POST /api/tags failed:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid tag data", errors: error.errors });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: `Tag with name value '${error.keyValue.name}' already exists.`,
      });
    }

    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().lean();
    return res.status(200).json({ tags });
  } catch (error) {
    console.error("GET /api/tags failed:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = { createTag, getTags };
