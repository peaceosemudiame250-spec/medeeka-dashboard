# 🎓 Backend Learning Guide

This guide explains how the backend works step-by-step so you can understand and modify it.

---

## Table of Contents

1. [Beginner Concepts](#beginner-concepts)
2. [How Registration Works](#how-registration-works)
3. [How Login Works](#how-login-works)
4. [Understanding JWT](#understanding-jwt)
5. [Understanding Password Hashing](#understanding-password-hashing)
6. [Understanding MongoDB](#understanding-mongodb)
7. [How to Modify Code](#how-to-modify-code)
8. [Debugging Tips](#debugging-tips)

---

## Beginner Concepts

### What is a Backend?

The backend is the **hidden part** of your app that:
- Stores data (database)
- Processes requests
- Validates information
- Generates responses

**Frontend** = What users see (HTML, CSS, JavaScript)
**Backend** = What happens behind the scenes (server, database)

### Request/Response Cycle

```
Frontend: "I want to register!"
   ↓
Backend: "Okay, let me check if you're valid..."
   ↓
Database: "Save this new patient"
   ↓
Backend: "Great! Here's your token"
   ↓
Frontend: "Thanks! I'll save this token"
```

### HTTP Methods

- **GET** - Retrieve data ("Show me my profile")
- **POST** - Create data ("Register me")
- **PUT** - Update data ("Change my phone")
- **DELETE** - Delete data ("Remove my account")

---

## How Registration Works

### Step-by-Step: Patient Registration

```javascript
// 1. User fills out form on frontend
User Input:
{
  fullName: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!",
  phoneNumber: "+1234567890",
  dateOfBirth: "1990-01-15",
  gender: "Male",
  emergencyContact: "Emergency Person"
}

// 2. Frontend sends POST request to backend
POST http://localhost:5000/api/auth/patient/register
Body: (same as above in JSON)

// 3. Backend server.js receives request
// Middleware processes it (CORS check, JSON parsing)

// 4. Router matches URL pattern
// URL matches: POST /api/auth/patient/register
// Function called: authController.registerPatient()

// 5. Controller validates input
if (!fullName || !email || !password) {
  return error("Missing required fields")
}

// 6. Controller checks for duplicate email
const existingPatient = await Patient.findOne({ email })
if (existingPatient) {
  return error("Email already registered")
}

// 7. Controller creates new patient
const patient = await Patient.create({
  fullName: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!", // Will be hashed by pre-save
  phoneNumber: "+1234567890",
  dateOfBirth: "1990-01-15",
  gender: "Male",
  emergencyContact: "Emergency Person"
})

// 8. Pre-save middleware runs AUTOMATICALLY
// This happens inside Patient.create() before saving
patientSchema.pre('save', async function() {
  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
  // Password now hashed!
})

// 9. Hashed data saved to MongoDB
Collection: patients
Document:
{
  _id: ObjectId("63f7..."),
  fullName: "John Doe",
  email: "john@example.com",
  password: "$2a$10$X9X9..." // HASHED, NOT PLAIN TEXT!
  ...
}

// 10. Controller generates JWT token
const token = jwt.sign(
  { id: patient._id, userType: 'patient' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
// token = "eyJhbGciOiJIUzI1NiI..."

// 11. Controller sends response
Response Status: 201 Created
Response Body:
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiI...",
  message: "Patient registered successfully",
  user: {
    id: "63f7...",
    fullName: "John Doe",
    email: "john@example.com"
  }
}

// 12. Frontend receives response
// Stores token in localStorage
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiI...')
localStorage.setItem('userType', 'patient')

// 13. Frontend redirects to patient home page
```

### Code in authController.js

```javascript
exports.registerPatient = async (req, res) => {
  try {
    // Extract data from request
    const { fullName, email, password, ... } = req.body;

    // Validate
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check duplicate
    let existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create (password will be hashed automatically)
    const patient = await Patient.create({
      fullName,
      email,
      password, // Hashed by pre-save middleware!
      ...
    });

    // Generate token
    const token = generateToken(patient._id, 'patient');

    // Return success
    res.status(201).json({
      success: true,
      token,
      message: 'Patient registered successfully'
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Key Points:**
- ✅ Password automatically hashed by pre-save middleware
- ✅ Validation checks both frontend AND backend
- ✅ Token generated and returned
- ✅ Errors caught and handled

---

## How Login Works

### Step-by-Step: Patient Login

```javascript
// 1. User enters email and password
Frontend Input:
{
  email: "john@example.com",
  password: "SecurePass123!"
}

// 2. Frontend sends POST to backend
POST http://localhost:5000/api/auth/patient/login
Body: { email, password }

// 3. Backend router matches URL
// Calls: authController.loginPatient()

// 4. Controller finds patient by email
const patient = await Patient.findOne({ email }).select('+password')
// Note: select('+password') because password normally hidden

// 5. Check if patient exists
if (!patient) {
  return error("Invalid email or password")
}

// 6. Compare password using bcryptjs
// This is the clever part!
const isValid = await patient.comparePassword(inputPassword)
// comparePassword() compares:
//   Input: "SecurePass123!"
//   Stored Hash: "$2a$10$X9X9..."
// bcryptjs figures out if they match!

// 7. If password wrong
if (!isValid) {
  return error("Invalid email or password")
}

// 8. If everything correct, generate token
const token = generateToken(patient._id, 'patient')

// 9. Send response with token
Response:
{
  success: true,
  token: "eyJhbGciOi...",
  message: "Patient logged in successfully"
}

// 10. Frontend stores token
localStorage.setItem('token', 'eyJhbGciOi...')
```

### Code in authController.js

```javascript
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find patient (include password)
    const patient = await Patient.findOne({ email }).select('+password');

    // Check exists
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await patient.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(patient._id, 'patient');

    // Return success
    res.status(200).json({
      success: true,
      token,
      message: 'Patient logged in successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Key Points:**
- ✅ .select('+password') includes hidden password
- ✅ comparePassword() uses bcryptjs to verify
- ✅ Never compares plain password to plain password!
- ✅ Token returned on success

---

## Understanding JWT

### What is JWT?

**JWT = JSON Web Token**

It's a secure way to prove who you are!

Think of it like:
- Regular ID card: Easy to copy, not secure
- JWT: Digital signature, can't be faked

### JWT Structure

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZjdhMWIyYzRkNSIsInVzZXJUeXBlIjoicGF0aWVudCIsImV4cCI6MTcwNTM2ODYwMH0.X9X9X9X9X9X9X9X9X9X9X9
```

**Part 1: Header** (Algorithm)
```json
{
  "alg": "HS256",  // Algorithm
  "typ": "JWT"     // Type
}
```

**Part 2: Payload** (Data)
```json
{
  "id": "63f7a1b2c4d5",      // User ID
  "userType": "patient",      // Patient or Doctor
  "exp": 1705368600          // Expires when (Unix timestamp)
}
```

**Part 3: Signature** (Proof)
```
HMACSHA256(
  base64(header) + "." + base64(payload),
  JWT_SECRET
)
```

### How JWT Verification Works

```javascript
// To verify a token:
const decoded = jwt.verify(token, process.env.JWT_SECRET)

// If JWT_SECRET matches, decode returns:
{
  id: "63f7a1b2c4d5",
  userType: "patient",
  exp: 1705368600,
  iat: 1704763800
}

// If token tampered with or secret wrong:
Error: "jwt malformed" or "invalid signature"
```

### Why JWT is Secure

**Scenario 1: Hacker tries to modify token**
```
Original: eyJhbGciOiJIUzI1NiI...
Hacker changes to: eyJhbGciOiJIUzI1NiI...modified...

When backend verifies:
HMACSHA256(modified_data, JWT_SECRET) != signature
→ Error! Token rejected!
```

**Scenario 2: Hacker tries to forge token**
```
Hacker tries to create: eyJhbGciOiJIUzI1NiI...forged...

Problem: Doesn't know JWT_SECRET!
Can't create valid signature
→ Error! Token rejected!
```

### How to Generate Token

```javascript
const token = jwt.sign(
  { id: user._id, userType: 'patient' },  // Data to encode
  process.env.JWT_SECRET,                 // Secret (from .env)
  { expiresIn: '7d' }                     // Expires in 7 days
)
```

### Storing Token on Frontend

```javascript
// After registration/login
localStorage.setItem('token', token)

// Before each API request
const token = localStorage.getItem('token')
// Include in headers: Authorization: Bearer <token>

// On logout
localStorage.removeItem('token')
```

---

## Understanding Password Hashing

### What is Password Hashing?

**Goal:** Store passwords securely, not as plain text!

### The Problem Without Hashing

```
Database Hack
    ↓
All passwords exposed!
    ↓
"user@example.com: MyPassword123"
    ↓
Hacker can login as anyone!
    ↓
Access patient data, prescriptions, etc.
```

### The Solution: Hashing

```javascript
// Plain password: "MyPassword123"
// Hash it: "$2a$10$X9X9X9X9X9X9X9X9X9X9X9X9..."

// Key property: ONE WAY
// Can't reverse: "$2a$10$X9X9..." → "MyPassword123" (IMPOSSIBLE!)

// But can verify:
// Does entered password hash to same hash?
// "MyPassword123" → hash → "$2a$10$X9X9..."?
// YES! ✅ Login allowed
```

### How bcryptjs Works

```javascript
// 1. Create salt (random data)
const salt = await bcryptjs.genSalt(10)
// salt = "$2a$10$x8x9x9x9x9x9x9x9x9x9"

// 2. Hash password with salt
const hashedPassword = await bcryptjs.hash('MyPassword123', salt)
// hashedPassword = "$2a$10$X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9"

// 3. Store hashed password
database.save({ password: hashedPassword })

// Later, on login:
// 4. Compare plain password with hash
const matches = await bcryptjs.compare('MyPassword123', hashedPassword)
// matches = true ✅

// Try wrong password:
const matches = await bcryptjs.compare('WrongPassword', hashedPassword)
// matches = false ✅
```

### Why Hashing Can't Be Reversed

Normal encryption:
```
plaintext + key → encrypt() → ciphertext
ciphertext + key → decrypt() → plaintext (reversible!)
```

Hashing:
```
plaintext → hash() → hash_value (CANNOT REVERSE!)
```

**Hashing is one-way!**

### In Your Code

```javascript
// Pre-save middleware in Patient.js
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
  next()
})

// Method in Patient.js
patientSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

// Usage in authController.js
const isValid = await patient.comparePassword(enteredPassword)
```

---

## Understanding MongoDB

### What is MongoDB?

**NoSQL Database** - stores data as JSON-like documents

### Comparison

**SQL Database (MySQL):**
```sql
-- Rigid structure
CREATE TABLE patients (
  id INT,
  name VARCHAR(100),
  email VARCHAR(100)
)

-- All rows have same columns
```

**NoSQL Database (MongoDB):**
```javascript
// Flexible structure
{
  _id: ObjectId,
  fullName: "John Doe",
  email: "john@example.com",
  // Can add any fields you want!
  bloodGroup: "O+",
  customField: "anything"
}
```

### Collections and Documents

```
Database: medeeka
├── Collection: patients (like a table)
│   ├── Document 1 (like a row)
│   │   {
│   │     _id: ObjectId("63f7..."),
│   │     fullName: "John Doe",
│   │     email: "john@example.com",
│   │     password: "$2a$10$..."
│   │   }
│   ├── Document 2
│   │   {...}
│   └── Document 3
│       {...}
└── Collection: doctors (like another table)
    ├── Document 1
    │   {...}
    └── Document 2
        {...}
```

### CRUD Operations

**Create**
```javascript
const patient = await Patient.create({
  fullName: "John Doe",
  email: "john@example.com",
  password: "hashed_password"
})
```

**Read**
```javascript
const patient = await Patient.findOne({ email: "john@example.com" })
const allPatients = await Patient.find()
```

**Update**
```javascript
await Patient.updateOne(
  { _id: patientId },
  { phoneNumber: "+1234567890" }
)
```

**Delete**
```javascript
await Patient.deleteOne({ _id: patientId })
```

### Schema Validation

```javascript
const patientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,  // No duplicates!
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // Email format
  },
  password: {
    type: String,
    required: true,
    minlength: 8  // At least 8 characters
  }
})
```

---

## How to Modify Code

### Example 1: Add a New Field to Patient

**Requirement:** Add blood type to patient

**Step 1:** Update Patient.js schema
```javascript
// In models/Patient.js
const patientSchema = new mongoose.Schema({
  fullName: {...},
  email: {...},
  // ... other fields ...

  // ADD THIS:
  bloodType: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    default: ''
  }
})
```

**Step 2:** Update registration form (already done!)
```javascript
// In frontend/script.js, the form already sends bloodGroup
const bloodGroup = document.getElementById('bloodGroup').value
```

**Step 3:** Update authController.js
```javascript
// In controllers/authController.js
const patient = await Patient.create({
  fullName,
  email,
  password,
  // ... other fields ...
  bloodGroup: bloodGroup || '',  // Add this
  // ...
})
```

**Done!** 🎉

### Example 2: Add Email Validation

**Requirement:** Send verification email

**Step 1:** Install email package
```bash
npm install nodemailer
```

**Step 2:** Create email service
```javascript
// Create: services/emailService.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    to: email,
    subject: 'Verify your Medeeka account',
    html: `<p>Your verification code: ${code}</p>`
  })
}

module.exports = { sendVerificationEmail }
```

**Step 3:** Use in authController.js
```javascript
// In registerPatient()
const verificationCode = generateRandomCode()
await sendVerificationEmail(email, verificationCode)

// Save code to database (temporary)
patient.verificationCode = verificationCode
patient.verificationExpires = Date.now() + 24 * 60 * 60 * 1000  // 24 hours
await patient.save()
```

### Example 3: Add Protected Routes

**Requirement:** Users need token to access profile

**Step 1:** Create auth middleware
```javascript
// Create: middleware/auth.js
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}

module.exports = { verifyToken }
```

**Step 2:** Use in routes
```javascript
// In routes/auth.js
const { verifyToken } = require('../middleware/auth')

// Protected route - needs valid token
router.get('/profile', verifyToken, async (req, res) => {
  const patient = await Patient.findById(req.user.id)
  res.json(patient)
})
```

**Step 3:** Use in frontend
```javascript
// In frontend/script.js
const token = localStorage.getItem('token')
const response = await fetch('http://localhost:5000/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`  // Send token
  }
})
```

---

## Debugging Tips

### Problem: Registration fails

**Check these in order:**

1. **Is server running?**
   ```bash
   # Should see:
   # 🚀 MEDEEKA BACKEND SERVER RUNNING
   npm run dev
   ```

2. **Is MongoDB running?**
   ```bash
   brew services list  # Check status
   brew services start mongodb-community  # Start if needed
   ```

3. **Check .env file**
   ```bash
   cat .env
   # Should have: MONGODB_URI, JWT_SECRET, PORT
   ```

4. **Is port 5000 in use?**
   ```bash
   lsof -i :5000  # See what's using port 5000
   kill -9 <PID>  # Kill if needed
   ```

5. **Check console errors**
   ```javascript
   // Add this in server.js
   app.use((err, req, res, next) => {
     console.error('ERROR:', err)  // See error details
     res.status(500).json({ error: err.message })
   })
   ```

### Problem: Password not hashing

**Check these:**

1. **Is bcryptjs installed?**
   ```bash
   npm list bcryptjs  # Should show version
   ```

2. **Is pre-save middleware in schema?**
   ```javascript
   // In models/Patient.js
   patientSchema.pre('save', async function(next) {
     if (!this.isModified('password')) return next()
     this.password = await bcryptjs.hash(this.password, 10)
     next()
   })
   ```

3. **Test hashing**
   ```bash
   # In terminal
   node -e "
   const bcryptjs = require('bcryptjs')
   bcryptjs.hash('TestPass123!', 10).then(hash => {
     console.log('Hashed:', hash)
     bcryptjs.compare('TestPass123!', hash).then(match => {
       console.log('Matches:', match)
     })
   })
   "
   ```

### Problem: JWT token invalid

**Check these:**

1. **Is JWT_SECRET same everywhere?**
   ```bash
   # In .env
   echo $JWT_SECRET
   ```

2. **Is token expiring too fast?**
   ```javascript
   // In authController.js
   const token = jwt.sign(
     { id, userType },
     process.env.JWT_SECRET,
     { expiresIn: '7d' }  // Change if needed
   )
   ```

3. **Test JWT verification**
   ```bash
   node -e "
   const jwt = require('jsonwebtoken')
   const token = jwt.sign({ id: 123 }, 'secret', { expiresIn: '7d' })
   console.log('Token:', token)
   const decoded = jwt.verify(token, 'secret')
   console.log('Decoded:', decoded)
   "
   ```

### Problem: CORS error in browser

**This means frontend can't access backend**

**Check:**
1. Frontend URL
   ```javascript
   // In server.js
   cors({
     origin: 'http://localhost:8000',  // Your frontend URL
     credentials: true
   })
   ```

2. Frontend is actually on that URL
   ```bash
   # Frontend should be at: http://localhost:8000
   # Not: http://127.0.0.1:8000 (different!)
   ```

### Useful Debugging Commands

```bash
# See all running processes on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# See npm packages
npm list

# Check if MongoDB is running
brew services list

# View MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log

# Connect to MongoDB CLI
mongosh
use medeeka
db.patients.find()
db.patients.count()
db.patients.deleteMany({})  # Clear all
```

### Add Logging to Understand Flow

```javascript
// In authController.js
exports.registerPatient = async (req, res) => {
  console.log('1. Register request received')
  console.log('   Email:', req.body.email)

  try {
    const { fullName, email, password } = req.body
    console.log('2. Extracted data')

    if (!email || !password) {
      console.log('3. Validation failed - missing fields')
      return res.status(400).json({ error: 'Missing fields' })
    }

    const existing = await Patient.findOne({ email })
    console.log('4. Checked for duplicates:', existing ? 'Found' : 'Not found')

    if (existing) {
      console.log('5. Email exists - returning error')
      return res.status(400).json({ error: 'Email exists' })
    }

    const patient = await Patient.create({
      fullName, email, password
    })
    console.log('6. Patient created:', patient._id)

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET)
    console.log('7. Token generated')

    console.log('8. Sending success response')
    res.status(201).json({ success: true, token })
  } catch (error) {
    console.log('ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
}
```

Then check the terminal to see exactly where it fails! 🔍

---

## Summary

**Key Learning Points:**

1. **Registration** - Validate, hash password, save, generate token
2. **Login** - Find user, compare passwords, generate token
3. **JWT** - Secure token that can't be forged
4. **Hashing** - One-way conversion, can't reverse
5. **MongoDB** - JSON-based document database
6. **Middleware** - Process requests before routes
7. **Error Handling** - Always try/catch and validate

**Next Steps:**

- [ ] Understand each file completely
- [ ] Modify code for your needs
- [ ] Add new features (email verification, password reset)
- [ ] Test with different scenarios
- [ ] Deploy to production
- [ ] Add monitoring and logging

Happy learning! 🎉
