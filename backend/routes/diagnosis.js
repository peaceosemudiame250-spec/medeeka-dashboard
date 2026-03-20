const express = require("express");
const router = express.Router();
const {
  runDiagnosis,
  getRecords,
} = require("../controllers/diagnosisController");

// POST /api/diagnosis/run
router.post("/run", runDiagnosis);

// GET /api/diagnosis/records?patientId=<id>
router.get("/records", getRecords);

module.exports = router;
