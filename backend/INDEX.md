# 📚 Backend Documentation Index

Welcome! This is your complete backend documentation. Start here!

---

## 🚀 Quick Start (5 minutes)

If you just want to get the server running:

```bash
# 1. Install dependencies
npm install

# 2. Make sure MongoDB is running
brew services start mongodb-community

# 3. Start server
npm run dev

# 4. Test it
curl http://localhost:5000/api/health
```

**Done!** Server is running on `http://localhost:5000`

---

## 📖 Documentation Guide

### For Beginners: Start Here

**New to backend? Read these in order:**

1. [**SUMMARY.md**](SUMMARY.md) - Overview of what we built (5 min read)
2. [**LEARNING.md**](LEARNING.md) - Beginner concepts explained (20 min read)
3. [**STRUCTURE.md**](STRUCTURE.md) - How files connect together (10 min read)
4. [**TESTING.md**](TESTING.md) - How to test the API (15 min read)

**After reading above, you'll understand:**

- How registration works
- How login works
- What JWT tokens are
- What password hashing is
- How MongoDB works
- How to modify code

### For Quick Reference

**Know backend? Use these for quick answers:**

- [**README.md**](README.md) - API endpoints & usage
- [**ARCHITECTURE.md**](ARCHITECTURE.md) - Technical architecture
- [**.env.example**](.env.example) - Configuration template

---

## 📁 File Guide

### Code Files

| File                            | Purpose              | Read if...                     |
| ------------------------------- | -------------------- | ------------------------------ |
| `server.js`                     | Main entry point     | You want to understand startup |
| `config/database.js`            | MongoDB connection   | Connection issues              |
| `models/Patient.js`             | Patient schema       | Adding patient fields          |
| `models/Doctor.js`              | Doctor schema        | Adding doctor fields           |
| `controllers/authController.js` | Authentication logic | Modifying auth flow            |
| `routes/auth.js`                | API endpoints        | Adding new routes              |

### Documentation Files

| File              | Purpose             | Read if...                      |
| ----------------- | ------------------- | ------------------------------- |
| `README.md`       | API documentation   | Using the API                   |
| `ARCHITECTURE.md` | System design       | Understanding the architecture  |
| `LEARNING.md`     | Learning guide      | Learning backend concepts       |
| `TESTING.md`      | Testing guide       | Testing the API                 |
| `STRUCTURE.md`    | Directory structure | Understanding file organization |
| `SUMMARY.md`      | Project overview    | High-level overview             |
| `INDEX.md`        | This file           | Getting oriented                |

### Configuration Files

| File           | Purpose                 |
| -------------- | ----------------------- |
| `package.json` | Dependencies & scripts  |
| `.env`         | Secrets (DO NOT COMMIT) |
| `.env.example` | Configuration template  |
| `.gitignore`   | Files to ignore in git  |

---

## 🎯 What Each Document Teaches

### SUMMARY.md

**Time:** 5 minutes
**You'll learn:**

- What backend does
- Project structure
- Key technologies
- API endpoints overview
- Security features
- Next steps

**Start here if:** You want a bird's-eye view

### LEARNING.md

**Time:** 30 minutes
**You'll learn:**

- How registration works (step-by-step)
- How login works (step-by-step)
- What JWT tokens are
- How password hashing works
- How MongoDB works
- How to modify code
- Debugging tips

**Start here if:** You're new to backend development

### STRUCTURE.md

**Time:** 15 minutes
**You'll learn:**

- Directory structure
- What each file does
- How files connect
- File responsibilities
- Testing matrix

**Start here if:** You want to understand the codebase organization

### TESTING.md

**Time:** 15 minutes
**You'll learn:**

- How to test with cURL
- How to test with Postman
- How to use MongoDB Compass
- Test scenarios
- Error troubleshooting

**Start here if:** You want to test the API

### README.md

**Time:** 20 minutes
**You'll learn:**

- API documentation
- Request/response examples
- Security features
- Common errors
- Next features
- Production deployment

**Start here if:** You're using the API

### ARCHITECTURE.md

**Time:** 20 minutes
**You'll learn:**

- System architecture
- Data flow explanation
- File-by-file breakdown
- Security at each layer
- Request flow examples

**Start here if:** You want to understand the technical design

---

## 🗂️ Project Structure

```
backend/
├── 📄 GETTING STARTED
│   ├── INDEX.md                   ← You are here!
│   ├── SUMMARY.md                 ← Start here for overview
│   ├── QUICK_START.md             ← Fast setup (not shown, implied)
│
├── 📚 LEARNING & REFERENCE
│   ├── LEARNING.md                ← Detailed learning guide
│   ├── ARCHITECTURE.md            ← Technical deep dive
│   ├── STRUCTURE.md               ← Code organization
│   ├── README.md                  ← Complete API docs
│   └── TESTING.md                 ← Testing guide
│
├── 💻 CODE
│   ├── server.js                  ← Main app entry
│   ├── package.json               ← Dependencies
│   ├── config/
│   │   └── database.js            ← MongoDB connection
│   ├── models/
│   │   ├── Patient.js             ← Patient data structure
│   │   └── Doctor.js              ← Doctor data structure
│   ├── controllers/
│   │   └── authController.js      ← Auth logic
│   └── routes/
│       └── auth.js                ← API routes
│
├── ⚙️ CONFIGURATION
│   ├── .env                       ← Secrets (git ignored)
│   ├── .env.example               ← Template
│   ├── .gitignore                 ← Git rules
│   └── setup.sh                   ← Setup script
```

---

## 🛤️ Learning Path Recommendations

### Path 1: "I'm Learning Backend"

1. Read [SUMMARY.md](SUMMARY.md) (5 min)
2. Read [LEARNING.md](LEARNING.md) (30 min)
3. Read [STRUCTURE.md](STRUCTURE.md) (15 min)
4. Test API in [TESTING.md](TESTING.md) (15 min)
5. Review [ARCHITECTURE.md](ARCHITECTURE.md) (20 min)
6. Start modifying code!

**Total time: ~90 minutes**
**Result: Deep understanding**

### Path 2: "I Just Need to Use the API"

1. Read [SUMMARY.md](SUMMARY.md) (5 min)
2. Skim [README.md](README.md) (10 min)
3. Test endpoints in [TESTING.md](TESTING.md) (15 min)

**Total time: ~30 minutes**
**Result: Can use the API**

### Path 3: "I Want to Debug Something"

1. Check [TESTING.md](TESTING.md) error section
2. Read relevant part of [LEARNING.md](LEARNING.md)
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) data flow
4. Add logging to code

**Total time: ~30 minutes**
**Result: Fix the issue**

### Path 4: "I Want to Add a Feature"

1. Understand current flow in [LEARNING.md](LEARNING.md)
2. Find relevant code file in [STRUCTURE.md](STRUCTURE.md)
3. Check examples in [README.md](README.md)
4. Modify code and test

**Total time: ~60 minutes**
**Result: New feature added**

---

## ❓ Frequently Asked Questions

### Q: Where do I start?

**A:** Read [SUMMARY.md](SUMMARY.md) first (5 minutes). Then decide:

- Beginner? → Read [LEARNING.md](LEARNING.md)
- Just need to use? → Read [README.md](README.md)
- Need to debug? → Check [TESTING.md](TESTING.md)

### Q: How do I run the server?

**A:** See **Quick Start** at the top of this document

### Q: How do I test the API?

**A:** See [TESTING.md](TESTING.md) for detailed instructions

### Q: How do I add a new field?

**A:** See "How to Modify Code" in [LEARNING.md](LEARNING.md)

### Q: What if something breaks?

**A:** Check "Debugging Tips" in [LEARNING.md](LEARNING.md) or [TESTING.md](TESTING.md)

### Q: Where are the databases?

**A:** MongoDB runs on your computer. Access with:

```bash
mongosh              # MongoDB shell
use medeeka          # Select database
db.patients.find()   # View patients
```

Or use [MongoDB Compass](https://www.mongodb.com/products/tools/compass) for visual access

### Q: How do I connect the frontend?

**A:** Frontend already configured! Just ensure:

1. Backend running on `http://localhost:5000`
2. Frontend running on `http://localhost:8000`
3. .env has correct URLs

### Q: Is this ready for production?

**A:** MVP-ready! ✅ For production:

- Change JWT_SECRET
- Use cloud MongoDB (MongoDB Atlas)
- Deploy server (Heroku, AWS, etc.)
- Enable HTTPS
- Add monitoring

See [README.md](README.md) for production deployment tips

---

## 🎓 Core Concepts Quick Reference

### Registration Flow

```
User fills form → POST /api/auth/patient/register
                → Validate → Hash password → Save to MongoDB
                → Generate JWT token → Return token to frontend
```

### Login Flow

```
User enters credentials → POST /api/auth/patient/login
                       → Find user → Compare passwords
                       → Generate JWT token → Return token
```

### JWT Token

```
Digital ID card that proves user is logged in
Format: Header.Payload.Signature
Expires: After 7 days
Can't be faked without secret key
```

### Password Hashing

```
Plain: "MyPassword123"
Hashed: "$2a$10$X9X9X9X9X9X9X9X9X9X9..."
One-way: Can't reverse hash
Verify: Compare plain password with hash (bcryptjs)
```

### MongoDB

```
Database: medeeka
Collections: patients, doctors
Documents: Individual patient/doctor records
Queries: Find, create, update, delete
Validation: Schema validation, unique fields
```

---

## 📞 Get Help

**For API questions:**

- Check [README.md](README.md) for endpoint documentation

**For understanding the code:**

- Check [LEARNING.md](LEARNING.md) for concepts
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for design

**For testing:**

- Check [TESTING.md](TESTING.md) for test scenarios

**For debugging:**

- Check "Debugging Tips" in [LEARNING.md](LEARNING.md)
- Check error list in [TESTING.md](TESTING.md)

**For modifying code:**

- Check "How to Modify Code" in [LEARNING.md](LEARNING.md)
- Check relevant code file in `code/` folder

---

## ✅ Quick Checklist

Before you start:

- [ ] Node.js installed (`node --version`)
- [ ] MongoDB installed (`mongosh --version`)
- [ ] Backend code downloaded
- [ ] Read this file (INDEX.md)
- [ ] Run `npm install` (first time only)
- [ ] Have MongoDB running
- [ ] Ran `npm run dev` successfully
- [ ] Tested health endpoint (`curl localhost:5000/api/health`)

If all checked, you're ready! 🎉

---

## 🚀 Next Steps

1. **Get server running**

   ```bash
   npm install && brew services start mongodb-community && npm run dev
   ```

2. **Test one endpoint**

   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Read appropriate documentation** (see Learning Path above)

4. **Test the API** with [TESTING.md](TESTING.md)

5. **Connect your frontend** - it's already configured!

---

## 📊 Documentation Stats

- **Total Pages:** 7 main documents + code files
- **Total Learning Time:** 60-120 minutes depending on path
- **Code Files:** 6 main files (server, config, 2 models, controller, routes)
- **Configuration:** 3 files (.env, .gitignore, package.json)
- **API Endpoints:** 4 endpoints (patient/doctor register/login)

---

## 🎯 Your Goal

✅ **Understand** how backend authentication works
✅ **Use** the API to register and login
✅ **Modify** code to add features
✅ **Debug** issues when they arise
✅ **Deploy** to production when ready

---

**Last updated:** January 2024
**Status:** Production Ready MVP ✅
**Questions?** Check the relevant documentation file above

---

## 🏁 Ready?

Pick a learning path above and start!

Recommended: Start with [SUMMARY.md](SUMMARY.md) → [LEARNING.md](LEARNING.md) → Test with [TESTING.md](TESTING.md)

Good luck! 🚀
