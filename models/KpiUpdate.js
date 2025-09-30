const mongoose = require("mongoose");

const kpiUpdateSchema = new mongoose.Schema(
  {
    kpi: { type: mongoose.Schema.Types.ObjectId, ref: "Kpi", required: true },
    updatedValue: { type: Number, required: true },
    comment: { type: String, default: "" },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

kpiUpdateSchema.index({ kpi: 1 });

module.exports = mongoose.model("KpiUpdate", kpiUpdateSchema);
