require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const kpiRoutes = require("./routes/kpi.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const app = express();
app.use(cors());
app.use(express.json());

// connect DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.use("/api", authRoutes);
app.use("/api", kpiRoutes);
app.use("/api", userRoutes);

app.use("/api", dashboardRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
