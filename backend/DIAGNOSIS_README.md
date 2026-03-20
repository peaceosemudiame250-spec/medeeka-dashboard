Diagnosis MVP
===============

This documents the local diagnosis MVP implemented in this repo.

Files added/changed
- `backend/data/conditions.json` - curated condition list (editable)
- `backend/controllers/diagnosisController.js` - main endpoint logic for `/api/diagnosis/run`
- `backend/routes/diagnosis.js` - route registered in `server.js`
- `client-side/signin & signout/Patient Page/patient.html` - added AI assessment form and results area
- `client-side/signin & signout/Patient Page/dashboard.js` - added `startAI()` and rendering logic

How to run locally
1. Install backend deps

```bash
cd backend
npm install
```

2. Ensure Node 18+ is recommended. If using older Node, `node-fetch` is included as a dependency.

3. Start server (if you don't need DB features, the server will still start but some auth routes may fail without `MONGO_URI`):

```bash
npm start
```

4. Open patient page locally (served by a dev server or open the HTML directly) and use the AI form. The patient page calls `POST /api/diagnosis/run` on the backend.

Endpoint
- `POST /api/diagnosis/run`
  - Body: `{ age, gender, symptoms, durationDays, existingConditions }` where `symptoms` may be a comma-separated string or array.
  - Response (example):

```json
{
  "success": true,
  "source": "local",
  "topConditions": [ { "id": "condition_a", "name": "Condition A", "riskScore": 67 } ],
  "riskLevel": "Medium",
  "reasoning": ["Condition A: 2 symptom match(es); duration 3 day(s)"],
  "recommendation": "Monitor symptoms and follow up with GP if persist"
}
```

Notes
- The system uses a deterministic, keyword-based scorer for explainability. You can extend `backend/data/conditions.json` to add more conditions and keywords.
- Optional: add `INFERMEDICA_APP_ID` and `INFERMEDICA_APP_KEY` to `.env` to try the Infermedica sandbox (handled as best-effort fallback).
- This MVP is for education/triage only; always include disclaimers in the UI.
