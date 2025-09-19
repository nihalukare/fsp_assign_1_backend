const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGODB;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Database connected successfully.");
  } catch (error) {
    console.log("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
