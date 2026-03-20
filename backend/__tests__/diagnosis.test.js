const { _localDiagnose } = require("../controllers/diagnosisController");

describe("localDiagnose scoring (MVP)", () => {
  test("fever,cough should prioritize Condition A", () => {
    const res = _localDiagnose({
      symptoms: "fever,cough",
      durationDays: 2,
      age: 30,
      existingConditions: [],
    });
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].id).toBe("condition_a");
    expect(res[0].riskScore).toBeGreaterThan(0);
  });

  test("chest pain should prioritize Condition C and set high risk (red flag)", () => {
    const res = _localDiagnose({
      symptoms: "chest pain",
      durationDays: 1,
      age: 45,
      existingConditions: [],
    });
    expect(res[0].id).toBe("condition_c");
    expect(res[0].hasRedFlag).toBe(true);
    expect(res[0].riskScore).toBeGreaterThanOrEqual(80);
  });

  test("headache alone should prioritize Condition B", () => {
    const res = _localDiagnose({
      symptoms: ["headache"],
      durationDays: 0,
      age: 25,
      existingConditions: [],
    });
    expect(res[0].id).toBe("condition_b");
  });
});
