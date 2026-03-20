# Medeeka Backend API

This is the backend server for the Medeeka healthcare platform. It handles user authentication, patient/doctor registration, and login functionality.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Start MongoDB:**

```bash
# On macOS with Homebrew:
brew services start mongodb-community

# Or manually:
mongod
```

3. **Start the server (development mode):**

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Verify it's working:

Navigate to `http://localhost:5000/api/health` in your browser. You should see:

```json
{
  "success": true,
  "message": "✅ Server is running"
}
```

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection setup
├── models/
│   ├── Patient.js           # Patient schema and validation
│   └── Doctor.js            # Doctor schema and validation
├── controllers/
│   └── authController.js    # Authentication logic (register/login)
├── routes/
│   └── auth.js              # API route definitions
├── server.js                # Main Express app and server
├── package.json             # Dependencies
├── .env                     # Environment variables
└── .gitignore               # Git ignore rules
```

---

## 🔑 Environment Variables

The `.env` file contains important configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/medeeka

# Security
JWT_SECRET=your_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

**⚠️ Important:** Change `JWT_SECRET` to a strong random string in production!

---

## 📡 API Endpoints

### Patient Registration

**POST** `/api/auth/patient/register`

Request body:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "emergencyContact": "Jane Doe",
  "bloodGroup": "O+",
  "knownConditions": "Diabetes",
  "allergies": "Penicillin"
}
```

Response (success):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Patient registered successfully",
  "user": {
    "id": "63f7a1b2c4d5e6f7g8h9i0j1",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Patient Login

**POST** `/api/auth/patient/login`

Request body:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response (success):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Patient logged in successfully",
  "user": {
    "id": "63f7a1b2c4d5e6f7g8h9i0j1",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Doctor Registration

**POST** `/api/auth/doctor/register`

Request body:

```json
{
  "fullName": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "specialization": "Cardiology",
  "customSpecialization": "",
  "medicalLicenseNumber": "LICENSE123456",
  "hospital": "City General Hospital"
}
```

Response (success):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Doctor registered successfully",
  "user": {
    "id": "63f7a1b2c4d5e6f7g8h9i0j1",
    "fullName": "Dr. Jane Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology"
  }
}
```

---

### Doctor Login

**POST** `/api/auth/doctor/login`

Request body:

```json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

Response (success):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Doctor logged in successfully",
  "user": {
    "id": "63f7a1b2c4d5e6f7g8h9i0j1",
    "fullName": "Dr. Jane Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology"
  }
}
```

---

## 🛡️ Security Features

### Password Hashing

- Passwords are hashed using **bcryptjs** before being stored
- Never stored as plain text
- Original password is hashed with a salt for extra security

### JWT Tokens

- Tokens expire after 7 days
- Contain user ID and type (patient/doctor)
- Signed with a secret key

### Database Validation

- Email uniqueness enforced
- Doctor license number uniqueness enforced
- Required fields validated on server-side
- Email format validation

---

## 📝 Key Concepts Explained

### What is bcryptjs?

bcryptjs is a password hashing library. It converts plain passwords into irreversible hashes:

- "MyPassword123!" → "$2a$10$X9X9X9X9X9X9X9X9X9X9X9"
- The hash can't be reversed to get the original password
- Login compares entered password with stored hash

### What is JWT?

JWT (JSON Web Token) is a secure way to store user information:

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIs.eyJpZCI6IjYzZjdhMWIyYzRk.X9X9X9X9X9X9X9X9X9X9X9
```

- **Header:** Algorithm used (HS256)
- **Payload:** User data (ID, userType)
- **Signature:** Proof it wasn't tampered with

### What is MongoDB?

MongoDB is a NoSQL database that stores data in JSON-like documents:

- No rigid table structure (flexible)
- Collections (like tables) contain documents (like rows)
- Each document has fields (like columns)

---

## 🧪 Testing the API

### Using cURL (Terminal)

**Test Patient Registration:**

```bash
curl -X POST http://localhost:5000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "emergencyContact": "Emergency"
  }'
```

### Using Postman (GUI)

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new POST request
3. Enter URL: `http://localhost:5000/api/auth/patient/register`
4. Go to Body → Raw → JSON
5. Paste the request body and click Send

---

## 🐛 Common Errors

| Error                       | Cause                      | Solution                         |
| --------------------------- | -------------------------- | -------------------------------- |
| "Cannot connect to MongoDB" | MongoDB not running        | Start MongoDB: `mongod`          |
| "Email already registered"  | Email exists in database   | Use a different email            |
| "Invalid email or password" | Wrong credentials on login | Check email/password             |
| "Connection refused"        | Backend not running        | Start backend: `npm run dev`     |
| "CORS error"                | Frontend URL not allowed   | Check CORS settings in server.js |

---

## 📚 Learning Resources

### Understanding the Flow

**Registration Flow:**

1. Frontend sends form data to POST `/api/auth/patient/register`
2. Controller validates required fields
3. Check if email already exists
4. Create new patient document
5. Password is automatically hashed by MongoDB schema middleware
6. Generate JWT token
7. Return token to frontend
8. Frontend stores token in localStorage

**Login Flow:**

1. Frontend sends email + password
2. Controller finds patient by email
3. Compare entered password with stored hash using bcryptjs
4. If match, generate JWT token
5. Return token to frontend
6. Frontend uses token for authenticated requests

---

## 🚀 Next Steps

### Future Features

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Doctor credential verification
- [ ] Protected routes (middleware to verify JWT)
- [ ] User profile endpoints
- [ ] Appointment booking
- [ ] Doctor search/filter

### Production Deployment

- [ ] Use a production MongoDB instance (MongoDB Atlas)
- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS instead of HTTP
- [ ] Add rate limiting
- [ ] Set up logging/monitoring
- [ ] Use environment-specific .env files

---

## 📞 Support

For issues or questions, check:

1. MongoDB is running
2. .env file has correct values
3. Node modules installed: `npm install`
4. Check error messages in terminal

---

**Happy coding! 🎉**
