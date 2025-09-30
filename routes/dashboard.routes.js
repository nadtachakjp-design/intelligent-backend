const express = require("express");
const { auth } = require("../middleware/auth");
const KPI = require("../models/Kpi");

const router = express.Router();

router.get("/dashboard", auth(), async (req, res) => {
  try {
    const counts = await KPI.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ]);

    const summary = { ontrack: 0, atrisk: 0, offtrack: 0 };

    counts.forEach((c) => {
      const key = (c._id || "").toLowerCase();
      if (key.includes("on")) summary.ontrack = c.total;
      else if (key.includes("risk")) summary.atrisk = c.total;
      else if (key.includes("off")) summary.offtrack = c.total;
    });

    res.json(summary);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard/line", auth(), async (req, res) => {
  try {
    const { user, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.assignedUser = user;

    const data = await KPI.aggregate([
      { $match: { ...filter, status: "Achieved" } },
      {
        $group: {
          _id: { $month: "$endDate" },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = labels.map((_, i) => {
      const found = data.find((d) => d._id === i + 1);
      return found ? found.total : 0;
    });

    res.json({ labels, data: result });
  } catch (err) {
    console.error("Line chart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard/pie", auth(), async (req, res) => {
  try {
    const { user, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.assignedUser = user;

    const counts = await KPI.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ]);

    const result = {
      "On Track": 0,
      "At Risk": 0,
      "Off Track": 0,
    };

    counts.forEach((c) => {
      if (c._id && result[c._id] !== undefined) {
        result[c._id] = c.total;
      }
    });

    res.json(result);
  } catch (err) {
    console.error("Pie chart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/dashboard/table", auth(), async (req, res) => {
  try {
    const { user, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (user) filter.assignedUser = user;

    const rows = await KPI.find(filter)
      .populate("assignedUser", "username email")
      .sort({ createdAt: -1 })
      .lean();

    const mapped = rows.map((r) => ({
      _id: r._id,
      name: r.title,
      owner: r.assignedUser
        ? r.assignedUser.username || r.assignedUser.email
        : "-",
      target: r.targetValue,
      progress: r.actualValue,
      status: r.status,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Dashboard table error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
