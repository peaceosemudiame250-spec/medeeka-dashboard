# Backend Project Directory Structure

```
MVP_MEDEEKA_DASHBOARD/
│
├── client-side/                          (Frontend - Already Complete ✅)
│   └── signin & signout/
│       ├── index.html                    (7 pages: home, signin, signup, etc.)
│       ├── script.js                     (Form validation, API calls)
│       ├── style.css                     (Dark theme styling)
│       └── asset/
│
└── backend/                              (Backend - Just Created 🚀)
    │
    ├── 📄 Configuration Files
    │   ├── package.json                  (NPM dependencies & scripts)
    │   ├── .env                          (Environment variables)
    │   ├── .env.example                  (Template for .env)
    │   └── .gitignore                    (Files to ignore in git)
    │
    ├── 📁 config/
    │   └── database.js                   (MongoDB connection setup)
    │
    ├── 📁 models/
    │   ├── Patient.js                    (Patient schema & validation)
    │   └── Doctor.js                     (Doctor schema & validation)
    │
    ├── 📁 controllers/
    │   └── authController.js             (Register & login logic)
    │
    ├── 📁 routes/
    │   └── auth.js                       (API endpoint definitions)
    │
    ├── 🚀 server.js                      (Main Express app)
    │
    ├── 📚 Documentation
    │   ├── README.md                     (API docs & setup guide)
    │   ├── ARCHITECTURE.md               (System design explained)
    │   ├── TESTING.md                    (How to test API)
    │   └── SUMMARY.md                    (Project overview)
    │
    └── ⚙️ setup.sh                       (Automated setup script)
```

---

## File Descriptions

### 🔧 Configuration Files

**package.json**
- Lists all npm dependencies
- Scripts: `npm run dev` (development), `npm start` (production)
- Project metadata

**Files for environment variables:**
- `.env` - Actual secrets (DO NOT COMMIT)
- `.env.example` - Template (safe to commit)

**.gitignore**
- Prevents committing `node_modules/`, `.env`, logs, etc.

---

### 📁 Folders & Their Purpose

**config/**
- Database connection setup
- Shared configuration

**models/**
- Define data schemas
- Validation rules
- Pre-save middleware (hashing)
- Query methods

**controllers/**
- Business logic
- Handles requests
- Calls models
- Returns responses

**routes/**
- URL patterns
- Maps URLs to controller functions

---

### 📖 Key Files Explained

#### server.js (Main Entry Point)
```javascript
// Starts the Express server
// - Loads .env
// - Connects to MongoDB
// - Sets up middleware
// - Registers routes
// Run: npm run dev
```

#### config/database.js
```javascript
// Connects to MongoDB
// Uses MONGODB_URI from .env
// Exports connection for server.js
```

#### models/Patient.js & models/Doctor.js
```javascript
// Define what data can be stored
// Set validation rules
// Hash passwords before saving
// Methods to compare passwords
```

#### controllers/authController.js
```javascript
// Handles all registration & login logic
// Functions:
// - registerPatient(req, res)
// - loginPatient(req, res)
// - registerDoctor(req, res)
// - loginDoctor(req, res)
// - generateToken(id, userType)
```

#### routes/auth.js
```javascript
// Maps URLs to functions
// POST /api/auth/patient/register → registerPatient()
// POST /api/auth/patient/login    → loginPatient()
// POST /api/auth/doctor/register  → registerDoctor()
// POST /api/auth/doctor/login     → loginDoctor()
```

---

## 🔄 How Files Connect

```
browser request
       ↓
   server.js (entry point)
       ↓
middleware (CORS, JSON parser)
       ↓
   routes/auth.js (URL matching)
       ↓
controllers/authController.js (logic)
       ↓
models/Patient.js or Doctor.js (data validation)
       ↓
config/database.js (MongoDB connection)
       ↓
    MongoDB (storage)
       ↓
response sent back to browser
```

---

## 📦 What Gets Installed

When you run `npm install`, these packages are installed in `node_modules/`:

**Core Framework**
- `express` - Web framework
- `cors` - Allow cross-origin requests

**Database**
- `mongoose` - MongoDB ODM
- `mongodb` - MongoDB driver

**Security**
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `dotenv` - Load .env file

**Development**
- `nodemon` - Auto-restart on file changes

---

## 🚀 Startup Sequence

```
1. npm run dev
   ↓
2. Load .env file (MONGODB_URI, JWT_SECRET, PORT)
   ↓
3. Create Express app
   ↓
4. Set up middleware (CORS, JSON parser)
   ↓
5. Connect to MongoDB (config/database.js)
   ↓
6. Register routes (routes/auth.js)
   ↓
7. Start server on port 5000
   ↓
8. Listen for requests
   ↓
✅ Server ready!
```

---

## 📡 API Request Flow

```
Frontend
  ↓ POST /api/auth/patient/register
  ↓ with { fullName, email, password, ... }
  ↓
server.js (receives request)
  ↓
middleware (validates JSON, allows CORS)
  ↓
routes/auth.js (matches URL pattern)
  ↓
authController.registerPatient()
  ├─ Validates input
  ├─ Checks for duplicate email
  └─ Calls Patient.create()
  ↓
models/Patient.js (schema validation)
  ├─ Validates all required fields
  └─ Pre-save: hash password
  ↓
config/database.js → MongoDB
  └─ Saves document
  ↓
authController continues
  ├─ Generates JWT token
  └─ Returns response
  ↓
Frontend receives response with token
  ↓
Frontend stores token in localStorage
```

---

## 💾 Data Storage

**MongoDB Collections:**
- `patients` - Patient documents
- `doctors` - Doctor documents

**What's stored:**
```javascript
Patient {
  _id: ObjectId
  fullName: "John Doe"
  email: "john@example.com"
  password: "$2a$10$X9X9..." (HASHED!)
  phoneNumber: "+1234567890"
  dateOfBirth: Date
  gender: "Male"
  emergencyContact: "Jane"
  bloodGroup: "O+"
  knownConditions: ""
  allergies: ""
  createdAt: Date
  isVerified: false
}
```

---

## 🔐 Security At Each Layer

| Layer | Security |
|-------|----------|
| Frontend | Client-side validation, password strength meter |
| Network | CORS checks allowed domains |
| Server | Middleware validates JSON, HTTPS ready |
| Routes | URL validation, method checking |
| Controller | Input validation, business logic checks |
| Database | Schema validation, unique constraints |
| Storage | Passwords hashed (bcryptjs), not plain text |
| Token | JWT signed with secret, expires after 7 days |

---

## 🎯 Each File's Job

| File | Responsibility |
|------|-----------------|
| `server.js` | Start the app, set up middleware, connect routes |
| `config/database.js` | Connect to MongoDB |
| `models/Patient.js` | Define patient data structure & validation |
| `models/Doctor.js` | Define doctor data structure & validation |
| `controllers/authController.js` | Implement register & login logic |
| `routes/auth.js` | Map URLs to controller functions |
| `package.json` | Declare dependencies |
| `.env` | Store secrets (MongoDB URI, JWT secret) |
| `.env.example` | Show what variables are needed |

---

## 🧪 Testing Which File?

| What to test | Which file |
|--------------|-----------|
| Register patient | authController.js → Patient.js → MongoDB |
| Check password hashed | Patient.js → MongoDB |
| Login patient | authController.js → Patient.comparePassword() |
| JWT token valid | authController.js |
| Database connection | config/database.js |
| CORS working | server.js middleware |
| Routes found | routes/auth.js |

---

## ✅ File Checklist

- [x] server.js - Express app entry point
- [x] config/database.js - MongoDB connection
- [x] models/Patient.js - Patient schema
- [x] models/Doctor.js - Doctor schema
- [x] controllers/authController.js - Business logic
- [x] routes/auth.js - URL routing
- [x] package.json - Dependencies
- [x] .env - Environment variables
- [x] .env.example - Template
- [x] .gitignore - Git exclusions
- [x] README.md - API documentation
- [x] ARCHITECTURE.md - System design
- [x] TESTING.md - How to test
- [x] SUMMARY.md - Project overview
- [x] setup.sh - Setup automation

---

## 🎓 What Each Part Does

### Backend Request Processing

```
Request comes in
    ↓
CORS middleware - Check if source allowed
    ↓
JSON parser - Convert text to JavaScript
    ↓
Router - Find the right function
    ↓
Controller - Do the work
    ↓
Model - Validate and save to database
    ↓
Send response back
```

### Data Flow

```
Frontend form
    ↓ (JSON)
Backend server
    ↓ (validates)
MongoDB
    ↓ (stores)
Response token
    ↓ (JWT)
Frontend localStorage
```

---

**Everything is connected and ready to go!** 🎉

Start with: `npm run dev`
Test with: See TESTING.md
Learn more: See ARCHITECTURE.md
