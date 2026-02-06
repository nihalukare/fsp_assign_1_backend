const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedNewUser = await newUser.save();

    return res.status(201).json({
      message: "New user created successfully.",
      user: savedNewUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: `User with email ${error.keyValue.email} already exists.`,
      });
    }
    console.error("POST /api/auth/signup failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
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
};

const getUser = async (req, res) => {
  try {
    const { email } = req.user;
    const userDetails = await User.findOne({ email });

    res.status(200).json({ name: userDetails.name, email: userDetails.email });
  } catch (error) {
    console.error("GET /api/auth/me failed:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = { createUser, userLogin, getUser };
