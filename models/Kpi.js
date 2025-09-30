const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    targetValue: { type: String, required: true },
    actualValue: { type: String, default: 0 },
    status: {
      type: String,
      enum: ["On Track", "At Risk", "Off Track"],
      required: true,
      default: "On Track",
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Kpi || mongoose.model("Kpi", kpiSchema);
