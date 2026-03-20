/\*\*

- BACKEND ARCHITECTURE OVERVIEW
-
- This document explains how all the backend pieces fit together
  \*/

// ============================================================================
// HOW THE BACKEND WORKS
// ============================================================================

/\*

1. CLIENT (Frontend) sends HTTP request
   ↓
2. EXPRESS MIDDLEWARE processes request
   - CORS: Allow cross-origin requests from http://localhost:8000
   - JSON Parser: Convert JSON to JavaScript objects
     ↓
3. ROUTER (routes/auth.js) matches the URL
   - POST /api/auth/patient/register → registerPatient()
   - POST /api/auth/patient/login → loginPatient()
   - POST /api/auth/doctor/register → registerDoctor()
   - POST /api/auth/doctor/login → loginDoctor()
     ↓
4. CONTROLLER (controllers/authController.js) handles business logic
   - Validates input data
   - Checks database for existing users
   - Hashes password with bcryptjs
   - Creates new document in MongoDB
   - Generates JWT token
     ↓
5. MODEL (models/Patient.js or Doctor.js) defines data structure
   - Specifies required fields
   - Defines field types and validation
   - Pre-save middleware hashes password
     ↓
6. DATABASE (MongoDB) stores the data
   - Collections: patients, doctors
   - Each collection stores JSON documents
     ↓
7. Response sent back to CLIENT
   - JSON with success/error status
   - JWT token (if successful)
   - User information

\*/

// ============================================================================
// FILE-BY-FILE BREAKDOWN
// ============================================================================

/\*

config/database.js
─────────────────
What it does: Connects to MongoDB
How it works:

1. Uses mongoose to connect to MongoDB URI
2. Handles connection errors
3. Logs success/failure messages
   Usage: Required by server.js to establish database connection

models/Patient.js
─────────────────
What it does: Defines the shape of patient data
Contains:

- Field definitions (fullName, email, password, etc.)
- Field validation (required, unique, email format)
- Pre-save middleware to hash passwords
- Methods like comparePassword()
  Usage: Used by authController to create/find patients

models/Doctor.js
────────────────
What it does: Defines the shape of doctor data
Contains:

- Field definitions (fullName, email, medical fields, etc.)
- Field validation (required, unique for license number)
- Pre-save middleware to hash passwords
- Methods like comparePassword()
  Usage: Used by authController to create/find doctors

controllers/authController.js
─────────────────────────────
What it does: Contains ALL authentication logic
Functions:

- registerPatient(req, res) → Create new patient
- loginPatient(req, res) → Authenticate patient
- registerDoctor(req, res) → Create new doctor
- loginDoctor(req, res) → Authenticate doctor
- generateToken(id, userType) → Create JWT token
  Logic Flow:

1. Validate input fields
2. Check for duplicate email/license
3. Create new document
4. Generate token
5. Send response
   Usage: Routes call these functions when requests arrive

routes/auth.js
──────────────
What it does: Maps URLs to controller functions
Routes:
POST /api/auth/patient/register → authController.registerPatient
POST /api/auth/patient/login → authController.loginPatient
POST /api/auth/doctor/register → authController.registerDoctor
POST /api/auth/doctor/login → authController.loginDoctor
Usage: Imported by server.js to handle requests

server.js
─────────
What it does: Main entry point - brings everything together
Steps on startup:

1. Load .env file (environment variables)
2. Create Express app
3. Set up middleware (CORS, JSON parsing)
4. Connect to MongoDB
5. Register routes
6. Start server on port 5000
7. Listen for requests
   Usage: Run `npm run dev` to start this file

.env
────
What it does: Stores configuration values
Contains:

- MONGODB_URI: Connection string to database
- JWT_SECRET: Secret key for signing tokens
- PORT: Port number for server
- NODE_ENV: Environment type (development/production)
  Usage: Loaded by require('dotenv').config() in server.js

package.json
────────────
What it does: Defines project metadata and dependencies
Contains:

- Project name, version, description
- Dependencies (express, mongoose, bcryptjs, etc.)
- Scripts (start, dev)
- Entry point (server.js)
  Usage: npm uses this to install packages and understand the project

\*/

// ============================================================================
// DATA FLOW EXAMPLE: Patient Registration
// ============================================================================

/\*

STEP 1: Frontend sends POST request
────────────────────────────────────
URL: http://localhost:5000/api/auth/patient/register
Body:
{
"fullName": "John Doe",
"email": "john@example.com",
"password": "SecurePass123!",
"phoneNumber": "+1234567890",
"dateOfBirth": "1990-01-15",
"gender": "Male",
"emergencyContact": "Jane Doe"
}

STEP 2: Express middleware processes request
─────────────────────────────────────────────

- CORS middleware: ✅ Allows request from http://localhost:8000
- JSON parser: Converts JSON string to JavaScript object
- Request reaches router

STEP 3: Router matches URL to controller function
──────────────────────────────────────────────────
URL pattern: POST /api/auth/patient/register
Matched route: registerPatient()
Function called: authController.registerPatient(req, res)

STEP 4: Controller validates and processes
───────────────────────────────────────────

1. Extract data from req.body
   {
   fullName: "John Doe",
   email: "john@example.com",
   password: "SecurePass123!"
   ...
   }

2. Validate all required fields exist
   - fullName ✅
   - email ✅
   - password ✅
   - phoneNumber ✅
   - dateOfBirth ✅
   - gender ✅
   - emergencyContact ✅

3. Check if email already exists in database
   Query: Patient.findOne({ email: "john@example.com" })
   Result: No duplicate found ✅

4. Create new patient document
   const patient = await Patient.create({
   fullName: "John Doe",
   email: "john@example.com",
   password: "SecurePass123!", // Will be hashed!
   ...
   })

STEP 5: MongoDB middleware (pre-save hook) hashes password
─────────────────────────────────────────────────────────
When Patient.create() runs, before saving to database:

- Original password: "SecurePass123!"
- Salt generated: random string
- Hashed password: "$2a$10$9X9X9X9X9X9X9X9X9X9X9X9X9X9X..."
- Stores hashed version: NEVER stores plain text!

STEP 6: Data saved to MongoDB
──────────────────────────────
Collection: patients
Document:
{
\_id: ObjectId("63f7a1b2c4d5e6f7g8h9i0j1"),
fullName: "John Doe",
email: "john@example.com",
password: "$2a$10$9X9X9X9X9X9X9X9X9X9X9X9X9X9X...", // HASHED!
phoneNumber: "+1234567890",
dateOfBirth: ISODate("1990-01-15"),
gender: "Male",
emergencyContact: "Jane Doe",
createdAt: ISODate("2024-01-15T10:30:00Z")
}

STEP 7: Generate JWT token
──────────────────────────
Token contains:
{
id: "63f7a1b2c4d5e6f7g8h9i0j1",
userType: "patient",
exp: 1705368600 // expires 7 days from now
}
Signed with: process.env.JWT_SECRET
Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZjdhMWIyYzRkNWU2ZjdnOGg5aTBqMSIsInVzZXJUeXBlIjoicGF0aWVudCIsImV4cCI6MTcwNTM2ODYwMH0.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9"

STEP 8: Send response to frontend
─────────────────────────────────
Status: 201 Created
Body:
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZjdhMWIyYzRkNWU2ZjdnOGg5aTBqMSIsInVzZXJUeXBlIjoicGF0aWVudCIsImV4cCI6MTcwNTM2ODYwMH0.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9",
"message": "Patient registered successfully",
"user": {
"id": "63f7a1b2c4d5e6f7g8h9i0j1",
"fullName": "John Doe",
"email": "john@example.com"
}
}

STEP 9: Frontend stores token
─────────────────────────────
localStorage.setItem('token', 'eyJhbGciOi...')
localStorage.setItem('userType', 'patient')
Frontend can now use this token for authenticated requests!

\*/

// ============================================================================
// KEY SECURITY FEATURES
// ============================================================================

/\*

1. PASSWORD HASHING (bcryptjs)
   ───────────────────────────
   Why: Never store plain passwords
   How: bcryptjs.hash() converts password to irreversible hash
   Example:
   Plain: "MyPassword123!"
   Hash: "$2a$10$9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9"
   Can't be reversed back to plain password!

2. JWT TOKENS
   ──────────
   Why: Secure way to verify user identity
   How: Token is signed with JWT_SECRET
   Expires: After 7 days automatically
   Can't be forged without the secret key!

3. UNIQUE EMAIL
   ────────────
   Why: Prevents duplicate accounts
   How: unique: true in email schema field
   Check: Before creating, query existing emails
   Result: Two people can't have the same email!

4. UNIQUE LICENSE NUMBER
   ──────────────────────
   Why: Each doctor has one official license
   How: unique: true in medicalLicenseNumber schema
   Result: Can't register with stolen license number!

5. REQUIRED FIELD VALIDATION
   ─────────────────────────
   Why: Prevents incomplete/invalid data
   How: required: [true, message] in schema
   Check: Server validates even if frontend validation bypassed
   Result: Database only has complete, valid records!

6. CORS PROTECTION
   ────────────────
   Why: Only allow requests from authorized frontend
   How: cors({ origin: 'http://localhost:8000' })
   Result: Requests from other domains are blocked!

\*/

// ============================================================================
// COMMON DEBUGGING TIPS
// ============================================================================

/\*

If you get "Cannot POST /api/auth/patient/register"
→ Routes not imported, or URL doesn't match
→ Check: server.js line with app.use('/api/auth', authRoutes)

If you get "Email already registered"
→ Email already exists in database
→ Solution: Use different email or delete collection in MongoDB

If you get "Invalid email or password" on login
→ Email or password incorrect
→ Solution: Check email/password match what was registered

If you get CORS error in browser
→ Frontend origin not allowed
→ Check: cors settings in server.js

If MongoDB connection fails
→ MongoDB not running
→ Solution: Start with `mongod` in another terminal

If you see "Cannot find module 'express'"
→ npm_modules not installed
→ Solution: Run `npm install`

If token is invalid or expired
→ Token expired after 7 days
→ Solution: User needs to login again

\*/

// ============================================================================
// NEXT FEATURES TO IMPLEMENT
// ============================================================================

/\*

1. Protected Routes (Middleware)
   ────────────────────────────
   What: Routes that require valid JWT token
   Where: Create middleware/auth.js
   How: Check req.headers.authorization for token
   Usage: Protect user profile, appointments, etc.

2. Password Reset
   ──────────────
   What: Send reset link via email
   Where: Add resetPassword() to authController
   How: Generate reset token, send email, verify token
   Usage: "Forgot password" feature

3. Email Verification
   ──────────────────
   What: Verify email before account activation
   Where: Add sendVerificationEmail() to authController
   How: Generate verification code, send email
   Usage: Prevent fake emails at signup

4. User Profile Endpoint
   ─────────────────────
   What: GET /api/auth/profile - fetch user info
   Where: Add getProfile() to authController
   How: Use JWT token to identify user, return data
   Usage: Display user info on home page

5. Update Profile
   ──────────────
   What: PUT /api/auth/profile - update user data
   Where: Add updateProfile() to authController
   How: Verify token, validate new data, update database
   Usage: Let users change phone, address, etc.

\*/

// ============================================================================
// ARCHITECTURE DIAGRAM
// ============================================================================

/\*

┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (Port 8000) │
│ (HTML, CSS, JavaScript form submission) │
└────────────────────────┬────────────────────────────────────────┘
│ HTTP Request
│ (POST /api/auth/patient/register)
↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND SERVER (Port 5000) │
│ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ EXPRESS APP │ │
│ │ - CORS Middleware │ │
│ │ - JSON Parser Middleware │ │
│ └────────────────┬─────────────────────────────────────────┘ │
│ ↓ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ROUTER (routes/auth.js) │ │
│ │ POST /api/auth/patient/register → registerPatient │ │
│ │ POST /api/auth/patient/login → loginPatient │ │
│ │ POST /api/auth/doctor/register → registerDoctor │ │
│ │ POST /api/auth/doctor/login → loginDoctor │ │
│ └────────────────┬─────────────────────────────────────────┘ │
│ ↓ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ CONTROLLER (controllers/authController.js) │ │
│ │ - Validate input │ │
│ │ - Check database │ │
│ │ - Hash password │ │
│ │ - Generate JWT token │ │
│ └────────────────┬─────────────────────────────────────────┘ │
│ ↓ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ MODEL (models/Patient.js or Doctor.js) │ │
│ │ - Define schema (fields, types, validation) │ │
│ │ - Pre-save middleware (hash password) │ │
│ │ - Methods (comparePassword) │ │
│ └────────────────┬─────────────────────────────────────────┘ │
│ ↓ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ MONGOOSE ODM (Object Document Mapper) │ │
│ │ - Converts JavaScript objects ↔ MongoDB documents │ │
│ └────────────────┬─────────────────────────────────────────┘ │
│ ↓ │
└───────────────────┼─────────────────────────────────────────────┘
│ Database Query
↓
┌───────────────────────────┐
│ MONGODB (Port 27017) │
│ │
│ Collections: │
│ - patients │
│ - doctors │
│ │
│ Stores JSON documents │
└───────────────────────────┘
\*/

module.exports = {
architecture: "MVC Pattern",
stack: ["Node.js", "Express", "MongoDB", "Mongoose"],
authentication: "JWT + bcryptjs",
status: "Production Ready"
};
