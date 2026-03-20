/\*\*

- QUICK TESTING GUIDE
-
- Test your backend API without needing the frontend
- Use these instructions to verify everything is working
  \*/

// ============================================================================
// BEFORE YOU START
// ============================================================================

/\*

1. Install MongoDB (if not already installed)
   On Mac with Homebrew:
   brew install mongodb-community

2. Start MongoDB
   brew services start mongodb-community
   (Leave it running in the background)

3. Install backend dependencies
   cd backend
   npm install

4. Start backend server
   npm run dev
   You should see:
   ╔═══════════════════════════════════════╗
   ║ 🚀 MEDEEKA BACKEND SERVER RUNNING ║
   ╠═══════════════════════════════════════╣
   ║ Server: http://localhost:5000 ║
   ║ Environment: development ║
   ╚═══════════════════════════════════════╝

\*/

// ============================================================================
// TESTING WITH cURL (Terminal)
// ============================================================================

/\*

cURL = Command line tool to send HTTP requests
No GUI needed - just terminal!

TEST 1: Check Server Health
─────────────────────────────

Command:
curl http://localhost:5000/api/health

Expected Response:
{"success":true,"message":"✅ Server is running"}

Copy this command:
curl -X GET http://localhost:5000/api/health -H "Content-Type: application/json"

\*/

// ============================================================================
// TEST 2: Patient Registration
// ============================================================================

/\*

Command:
curl -X POST http://localhost:5000/api/auth/patient/register \
 -H "Content-Type: application/json" \
 -d '{
"fullName": "John Doe",
"email": "john@test.com",
"password": "TestPass123!",
"phoneNumber": "+1234567890",
"dateOfBirth": "1990-01-15",
"gender": "Male",
"emergencyContact": "Emergency Person",
"bloodGroup": "O+",
"knownConditions": "None",
"allergies": "None"
}'

Expected Response:
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"message": "Patient registered successfully",
"user": {
"id": "...",
"fullName": "John Doe",
"email": "john@test.com"
}
}

If you get "Email already registered":
→ Change the email to something unique (e.g., john2@test.com)

\*/

// ============================================================================
// TEST 3: Patient Login
// ============================================================================

/\*

Command (use the email from TEST 2):
curl -X POST http://localhost:5000/api/auth/patient/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "john@test.com",
"password": "TestPass123!"
}'

Expected Response:
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"message": "Patient logged in successfully",
"user": {
"id": "...",
"fullName": "John Doe",
"email": "john@test.com"
}
}

If you get "Invalid email or password":
→ Check that email and password are correct
→ Password is case-sensitive!

\*/

// ============================================================================
// TEST 4: Doctor Registration
// ============================================================================

/\*

Command:
curl -X POST http://localhost:5000/api/auth/doctor/register \
 -H "Content-Type: application/json" \
 -d '{
"fullName": "Dr. Jane Smith",
"email": "jane@test.com",
"password": "DoctorPass123!",
"phoneNumber": "+1987654321",
"specialization": "Cardiology",
"customSpecialization": "",
"medicalLicenseNumber": "LICENSE12345",
"hospital": "City General Hospital"
}'

Expected Response:
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"message": "Doctor registered successfully",
"user": {
"id": "...",
"fullName": "Dr. Jane Smith",
"email": "jane@test.com",
"specialization": "Cardiology"
}
}

If you get "Medical license number already registered":
→ Change the medicalLicenseNumber to something unique

\*/

// ============================================================================
// TEST 5: Doctor Login
// ============================================================================

/\*

Command (use the email from TEST 4):
curl -X POST http://localhost:5000/api/auth/doctor/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "jane@test.com",
"password": "DoctorPass123!"
}'

Expected Response:
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"message": "Doctor logged in successfully",
"user": {
"id": "...",
"fullName": "Dr. Jane Smith",
"email": "jane@test.com",
"specialization": "Cardiology"
}
}

\*/

// ============================================================================
// TESTING WITH POSTMAN (GUI - Easier!)
// ============================================================================

/\*

Postman = Visual HTTP client (easier than cURL)

INSTALLATION:

1. Download: https://www.postman.com/downloads/
2. Sign up or skip (optional)
3. Create new workspace

HOW TO TEST IN POSTMAN:

1. Create new request (Click "+ Tab")
2. Change HTTP method to POST (dropdown on left)
3. Enter URL: http://localhost:5000/api/auth/patient/register
4. Click "Body" tab below the URL
5. Select "raw" and "JSON" from dropdowns
6. Paste this JSON:
   {
   "fullName": "John Doe",
   "email": "john@postman.com",
   "password": "TestPass123!",
   "phoneNumber": "+1234567890",
   "dateOfBirth": "1990-01-15",
   "gender": "Male",
   "emergencyContact": "Emergency"
   }
7. Click "Send"
8. See response below!

Same process for other endpoints - just change the URL and body.

\*/

// ============================================================================
// ERROR TROUBLESHOOTING
// ============================================================================

/\*

ERROR: "Cannot connect to localhost:5000"
→ Backend server not running
→ Solution: Run `npm run dev` in backend folder

ERROR: "Cannot POST /api/auth/patient/register"
→ Route doesn't exist or server not running
→ Solution: Check server is running and URL is correct

ERROR: "Email already registered"
→ That email already exists in database
→ Solution: Use a different email or clear database

ERROR: "MongoDB connection failed"
→ MongoDB not running
→ Solution: Run `brew services start mongodb-community`

ERROR: "Invalid email or password"
→ Email/password combination doesn't exist
→ Solution: Verify credentials match what you registered

ERROR: "CORS error in browser"
→ Frontend trying to access backend
→ Likely already fixed in server.js
→ Check CORS settings if issues persist

ERROR: JSON parse error
→ Malformed JSON in request body
→ Solution: Check JSON formatting (quotes, commas, brackets)

\*/

// ============================================================================
// VIEWING DATABASE
// ============================================================================

/\*

MongoDB Compass = Visual GUI for MongoDB

1. Download: https://www.mongodb.com/products/tools/compass
2. Connect to: mongodb://localhost:27017
3. Browse collections:
   - medeeka > patients (patient records)
   - medeeka > doctors (doctor records)
4. See password is hashed! 🔐

Or use MongoDB CLI:

View all patients:
mongosh
use medeeka
db.patients.find()

View specific patient:
db.patients.findOne({ email: "john@test.com" })

Delete a patient (for testing):
db.patients.deleteOne({ email: "john@test.com" })

Clear all patients:
db.patients.deleteMany({})

\*/

// ============================================================================
// QUICK REFERENCE
// ============================================================================

/\*

✅ Server Health: GET http://localhost:5000/api/health
✅ Patient Register: POST http://localhost:5000/api/auth/patient/register
✅ Patient Login: POST http://localhost:5000/api/auth/patient/login
✅ Doctor Register: POST http://localhost:5000/api/auth/doctor/register
✅ Doctor Login: POST http://localhost:5000/api/auth/doctor/login

All requests/responses use JSON format.

\*/

module.exports = {
testing: "See README.md and ARCHITECTURE.md for more details",
tools: ["cURL (terminal)", "Postman (GUI)", "MongoDB Compass (visual DB)"],
status: "Ready for testing!"
};
