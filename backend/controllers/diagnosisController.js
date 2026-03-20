/**
 * Diagnosis controller for Medeeka MVP.
 * - Extracts patientId from JWT token (required)
 * - Fetches user profile (age from DOB, gender)
 * - Runs AI Reasoning Engine for preventive assessment
 * - Persists results with calculated demographics
 */

const DiagnosisRecord = require("../models/Diagnosis");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { calculateAge } = require("../utils/ageCalculator");
const { analyzeSymptoms } = require("../engines/aiReasoningEngine");

// Local rule-based scorer removed in favor of aiReasoningEngine
// All diagnosis logic now handled in engines/aiReasoningEngine.js

exports.runDiagnosis = async (req, res) => {
  try {
    console.log("📨 Diagnosis request received");
    console.log("   Origin:", req.get("origin"));
    console.log("   Method:", req.method);
    console.log("   Path:", req.path);
    console.log("   Headers:", {
      auth: req.get("authorization") ? "✓ Present" : "✗ Missing",
      contentType: req.get("content-type"),
      cors: req.get("access-control-request-method"),
    });
    console.log("   Body:", req.body);

    const {
      symptoms,
      durationDays = 0,
      existingConditions = [],
    } = req.body || {};

    if (
      !symptoms ||
      (Array.isArray(symptoms) && symptoms.length === 0) ||
      (!Array.isArray(symptoms) && String(symptoms).trim() === "")
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Provide symptoms (text or array)" });
    }

    // Normalize symptoms once for use throughout the function
    const normalizedSymptoms = Array.isArray(symptoms)
      ? symptoms.map((s) => s.toLowerCase().trim())
      : symptoms
          .split(/,|;/)
          .map((s) => s.toLowerCase().trim())
          .filter(Boolean);

    // Extract userId from JWT (REQUIRED)
    let userId = null;
    try {
      const auth =
        req.headers && (req.headers.authorization || req.headers.Authorization);
      if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized: Please include valid JWT token in Authorization header",
        });
      }
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.id;
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or missing JWT token",
      });
    }

    // Fetch user profile to get Date of Birth and Gender
    let user;
    try {
      user = await User.findById(userId).select(
        "dateOfBirth gender knownConditions",
      );
    } catch (err) {
      console.error("Error fetching user:", err.message);
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    // Calculate age from DOB and extract gender (silently used in scoring)
    const age = calculateAge(user.dateOfBirth) || 30;
    const gender = user.gender || "other";
    const medicalHistory = existingConditions.length
      ? existingConditions
      : user.knownConditions
        ? [user.knownConditions]
        : [];

    // Run AI Reasoning Engine for preventive assessment
    const aiResult = analyzeSymptoms({
      age,
      gender,
      symptoms: Array.isArray(symptoms)
        ? symptoms
        : symptoms.split(/,|;/).map((s) => s.trim()),
      duration: durationDays,
      medicalHistory,
    });

    // Persist record to database with exact specification format
    try {
      // Ensure recommendation includes doctor visit advice
      const finalRecommendation =
        aiResult.preventiveAdvice &&
        !aiResult.preventiveAdvice.includes("Visit your doctor")
          ? `${aiResult.preventiveAdvice} Visit your doctor if issue persists for more than 2 days.`
          : aiResult.preventiveAdvice ||
            "Visit your doctor if issue persists for more than 2 days.";

      await DiagnosisRecord.create({
        userId,
        timestamp: new Date().toISOString(),
        age,
        gender,
        symptoms: normalizedSymptoms,
        durationDays,
        medicalHistory: Array.isArray(medicalHistory)
          ? medicalHistory.map((c) => c.toLowerCase().trim())
          : [medicalHistory.toLowerCase().trim()].filter(Boolean),
        topPossibleConditions: aiResult.topPossibleConditions,
        riskLevel: aiResult.riskLevel,
        recommendation: finalRecommendation,
        preventiveAdvice: aiResult.preventiveAdvice,
        redFlagsDetected: aiResult.redFlagsDetected || [],
        disclaimer: aiResult.disclaimer,
        source: "ai-reasoning-engine",
      });
      console.log("✅ Diagnosis record saved to database");
    } catch (err) {
      console.warn("⚠️ Failed to save diagnosis record:", err.message);
    }

    // Return exact JSON structure as specified
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      symptoms: normalizedSymptoms,
      topPossibleConditions: aiResult.topPossibleConditions,
      riskLevel: aiResult.riskLevel,
      recommendation:
        aiResult.preventiveAdvice &&
        !aiResult.preventiveAdvice.includes("Visit your doctor")
          ? `${aiResult.preventiveAdvice} Visit your doctor if issue persists for more than 2 days.`
          : aiResult.preventiveAdvice ||
            "Visit your doctor if issue persists for more than 2 days.",
      disclaimer: aiResult.disclaimer,
    });
  } catch (error) {
    console.error("Diagnosis Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/diagnosis/records?userId=<id>
// Returns all past AI assessments for a user in descending timestamp order
exports.getRecords = async (req, res) => {
  try {
    // Prefer JWT-derived user id
    let userId = null;
    try {
      const auth =
        req.headers && (req.headers.authorization || req.headers.Authorization);
      if (auth && auth.startsWith("Bearer ")) {
        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) userId = decoded.id;
      }
    } catch (err) {
      console.warn("JWT verify failed in getRecords:", err.message);
    }

    if (!userId) userId = req.query.userId || null;
    if (!userId)
      return res.status(400).json({
        success: false,
        message:
          "Provide userId (query) or include Authorization Bearer token",
      });

    // Fetch all records for this user, sorted by timestamp descending
    const records = await DiagnosisRecord.find({ userId })
      .sort({ timestamp: -1 })
      .lean();

    // Transform each record to exact specification format
    const formattedRecords = records.map((record) => ({
      timestamp: record.timestamp || record.createdAt,
      symptoms: record.symptoms || [],
      topPossibleConditions: record.topPossibleConditions || [],
      riskLevel: record.riskLevel || "Low",
      recommendation: record.recommendation || record.preventiveAdvice,
      disclaimer:
        record.disclaimer ||
        "This is a preventive health assessment and not a medical diagnosis.",
    }));

    return res.status(200).json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords,
    });
  } catch (err) {
    console.error("GetRecords Error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
