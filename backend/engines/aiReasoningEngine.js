const CONDITIONS = require("../data/african_health_conditions.json");

const RED_FLAG_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "severe breathing",
  "shortness of breath at rest",
  "loss of consciousness",
  "unconscious",
  "severe bleeding",
  "hemorrhage",
  "stiff neck",
  "severe headache with fever",
  "seizures",
  "convulsion",
  "severe dehydration",
  "shock",
  "severe abdominal pain",
];

function normalizeText(text) {
  return (text || "").toLowerCase().trim();
}

function normalizeList(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(normalizeText).filter(Boolean);
  return input
    .split(/,|;|\n/)
    .map((s) => normalizeText(s))
    .filter(Boolean);
}

function detectRedFlags(symptoms) {
  const normalizedSymptoms = normalizeList(symptoms);
  const detected = [];

  RED_FLAG_KEYWORDS.forEach((flag) => {
    normalizedSymptoms.forEach((symptom) => {
      if (symptom.includes(flag) || flag.includes(symptom)) {
        if (!detected.includes(flag)) {
          detected.push(flag);
        }
      }
    });
  });

  return detected;
}

function calculateSymptomMatch(conditionKeywords, userSymptoms) {
  const normalizedSymptoms = normalizeList(userSymptoms);
  let matches = 0;

  conditionKeywords.forEach((keyword) => {
    normalizedSymptoms.forEach((symptom) => {
      if (symptom.includes(keyword) || keyword.includes(symptom)) {
        matches += 1;
      }
    });
  });

  return matches;
}

function scoreCondition(condition, input) {
  const {
    age = 30,
    gender = "other",
    symptoms = [],
    duration = 0,
    medicalHistory = [],
  } = input;

  const baseWeight = 30;
  const symptomMatches = calculateSymptomMatch(
    condition.commonSymptoms,
    symptoms,
  );
  const redFlagMatches = calculateSymptomMatch(
    condition.redFlagSymptoms,
    symptoms,
  );
  const historyRelevance = medicalHistory.filter((h) =>
    JSON.stringify(condition).toLowerCase().includes(normalizeText(h)),
  ).length;

  let score = 0;

  if (symptomMatches > 0) {
    const matchRatio =
      symptomMatches / Math.max(1, condition.commonSymptoms.length);
    score += baseWeight * Math.min(matchRatio, 1);
  }

  if (redFlagMatches > 0) {
    score += 20;
  }

  if (historyRelevance > 0) {
    score += 10 * historyRelevance;
  }

  const ageWeighting =
    condition.ageWeighting[
      `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9}`
    ] ||
    condition.ageWeighting[
      `${Math.max(0, Math.floor(age / 10) * 10)}-${Math.floor(age / 10) * 10 + 9}`
    ] ||
    condition.ageWeighting["15-50"] ||
    1.0;

  const genderWeighting =
    condition.genderWeighting[gender] ||
    condition.genderWeighting["other"] ||
    1.0;

  score *= ageWeighting;
  score *= genderWeighting;

  const durationFavorBonus = Math.min(10, (parseInt(duration) || 0) / 7);
  score += durationFavorBonus;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function generateReasoning(condition, matchCount, score) {
  if (matchCount === 0)
    return "Symptom profile warrants consideration based on risk factors.";

  const matchPhrase =
    matchCount === 1
      ? "One symptom overlap with common presentation."
      : `${matchCount} symptoms align with common presentation.`;

  if (score >= 75) {
    return `${matchPhrase} Strong symptom correlation.`;
  } else if (score >= 50) {
    return `${matchPhrase} Moderate relevance based on profile.`;
  } else {
    return `${matchPhrase} Lower confidence but still clinically relevant.`;
  }
}

function calculateOverallRiskScore(topConditions, redFlags) {
  if (redFlags.length > 0) {
    return 85;
  }

  const avgConfidence =
    topConditions.reduce((sum, c) => sum + c.confidence, 0) /
    topConditions.length;

  if (avgConfidence >= 70)
    return Math.min(100, 70 + (avgConfidence - 70) * 0.5);
  if (avgConfidence >= 50) return 50 + (avgConfidence - 50) * 0.4;
  return avgConfidence * 0.6;
}

function determineRiskLevel(riskScore, redFlags) {
  if (redFlags.length > 0 || riskScore >= 85) {
    return "Emergency";
  }
  if (riskScore >= 70) {
    return "High";
  }
  if (riskScore >= 40) {
    return "Moderate";
  }
  return "Low";
}

function generatePreventiveAdvice(riskLevel, topConditions) {
  if (riskLevel === "Emergency") {
    return "This assessment indicates potential urgent health concerns. Seek immediate medical evaluation at the nearest healthcare facility.";
  }

  if (riskLevel === "High") {
    return "Please consider consulting a healthcare provider soon for professional evaluation. Monitor your symptoms closely and keep track of any changes.";
  }

  if (riskLevel === "Moderate") {
    return "Monitor your symptoms over the next few days. If symptoms persist or worsen, consult a healthcare provider. Maintain good hydration and rest.";
  }

  return "Maintain general wellness practices: adequate sleep, hydration, balanced nutrition, and regular physical activity. Symptoms suggest low-risk profile but monitor for changes.";
}

function analyzeSymptoms(input) {
  try {
    const {
      age = 30,
      gender = "other",
      symptoms = [],
      duration = 0,
      medicalHistory = [],
    } = input;

    if (!symptoms || symptoms.length === 0) {
      return {
        riskLevel: "Low",
        riskScore: 0,
        redFlagsDetected: [],
        topPossibleConditions: [
          {
            condition: "No symptoms provided",
            confidenceScore: 0,
            reasoning: "Unable to assess without symptom information.",
          },
          {
            condition: "General wellness assessment recommended",
            confidenceScore: 0,
            reasoning: "Baseline preventive health screening suggested.",
          },
          {
            condition: "Consult healthcare provider",
            confidenceScore: 0,
            reasoning: "Professional evaluation for preventive care.",
          },
        ],
        preventiveAdvice:
          "Please provide symptoms or concerns for assessment. Regular health check-ups are recommended for preventive care.",
        disclaimer:
          "This is a preventive health assessment and not a medical diagnosis.",
      };
    }

    const redFlags = detectRedFlags(symptoms);

    const scoredConditions = CONDITIONS.conditions.map((condition) => {
      const matchCount = calculateSymptomMatch(
        condition.commonSymptoms,
        symptoms,
      );
      const confidence = scoreCondition(condition, {
        age,
        gender,
        symptoms,
        duration,
        medicalHistory,
      });
      const reasoning = generateReasoning(condition, matchCount, confidence);

      return {
        condition: condition.condition,
        confidence,
        reasoning,
        matchCount,
      };
    });

    const topConditions = scoredConditions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const overallRiskScore = calculateOverallRiskScore(
      topConditions.map((c) => ({ confidence: c.confidence })),
      redFlags,
    );

    const riskLevel = determineRiskLevel(overallRiskScore, redFlags);
    const preventiveAdvice = generatePreventiveAdvice(riskLevel, topConditions);

    return {
      riskLevel,
      riskScore: Math.round(overallRiskScore),
      redFlagsDetected: redFlags.length > 0 ? redFlags : [],
      topPossibleConditions: topConditions.map((c) => ({
        condition: c.condition,
        confidenceScore: c.confidence,
        reasoning: c.reasoning,
      })),
      preventiveAdvice,
      disclaimer:
        "This is a preventive health assessment and not a medical diagnosis.",
    };
  } catch (err) {
    console.error("AI Reasoning Engine Error:", err.message);
    return {
      riskLevel: "Moderate",
      riskScore: 50,
      redFlagsDetected: [],
      topPossibleConditions: [
        {
          condition: "Unable to process assessment",
          confidenceScore: 0,
          reasoning: "System encountered error during analysis.",
        },
        {
          condition: "Seek healthcare provider",
          confidenceScore: 100,
          reasoning: "Professional medical evaluation recommended.",
        },
        {
          condition: "Provide detailed symptom information",
          confidenceScore: 0,
          reasoning: "More specific symptoms improve assessment accuracy.",
        },
      ],
      preventiveAdvice:
        "Please consult a healthcare provider for comprehensive evaluation. System experienced temporary processing issue.",
      disclaimer:
        "This is a preventive health assessment and not a medical diagnosis.",
    };
  }
}

module.exports = { analyzeSymptoms };
