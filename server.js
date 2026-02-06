require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const { connectDB } = require("./db/db.connect");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/tasks.routes");
const teamRoutes = require("./routes/teams.routes");
const projectRoutes = require("./routes/projects.routes");
const tagRoutes = require("./routes/tags.routes");
const reportRoutes = require("./routes/report.routes");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth/", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT", PORT);
  });
});
