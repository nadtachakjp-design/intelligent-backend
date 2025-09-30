const express = require("express");
const Kpi = require("../models/Kpi");
const KpiUpdate = require("../models/KpiUpdate");
const { auth } = require("../middleware/auth");

const router = express.Router();


router.get("/kpis", auth(), async (_req, res) => {
  const data = await Kpi.find().sort({ createdAt: -1 });
  res.json(data);
});


router.post("/kpis", auth("admin"), async (req, res) => {
  const body = req.body;
  const kpi = await Kpi.create({
    title: body.title,
    description: body.description || "",
    targetValue: body.targetValue || "",
    actualValue: body.actualValue || "",
    status: body.status,
    assignedUser: body.assignedUser || null,
    startDate: body.startDate,
    endDate: body.endDate,
  });
  res.json(kpi);
});

router.put("/kpis/:id", auth(), async (req, res) => {
  const { role, id: userId } = req.user || {};
  const body = req.body;

  let patch = body;
  if (role === "user") {
    patch = { status: body.status };
  }

  const before = await Kpi.findById(req.params.id);
  const afterActual =
    patch.actualValue != null ? patch.actualValue : before.actualValue;

  const updated = await Kpi.findByIdAndUpdate(
    req.params.id,
    {
      ...patch,
      ...(patch.targetValue != null && {
        targetValue: patch.targetValue,
      }),
      ...(patch.actualValue != null && {
        actualValue: patch.actualValue,
      }),
    },
    { new: true }
  );

  if (
    role !== "user" &&
    patch.actualValue != null &&
    before.actualValue !== afterActual
  ) {
    await KpiUpdate.create({
      kpi: updated._id,
      updatedValue: afterActual,
      comment: body.comment || "",
      updatedBy: userId || null,
    });
  }

  res.json(updated);
});

router.delete("/kpis/:id", auth("admin"), async (req, res) => {
  const doc = await Kpi.findByIdAndDelete(req.params.id);
  if (doc) await KpiUpdate.deleteMany({ kpi: doc._id }); 
  res.json({ ok: true });
});

router.get("/kpis/:id/updates", auth(), async (req, res) => {
  const rows = await KpiUpdate.find({ kpi: req.params.id })
    .sort({ createdAt: -1 })
    .populate("updatedBy", "name email");
  res.json(rows);
});

module.exports = router;
