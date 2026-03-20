/**
 * AUTHENTICATION ROUTES
 *
 * This file defines the URL endpoints for authentication
 * When frontend sends a POST request to /api/auth/patient/register,
 * this file routes it to the correct controller function
 */

const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerDoctor,
  loginDoctor,
} = require("../controllers/authController");

/**
 * USER ROUTES
 */

// POST /api/auth/user/register
// Handle user registration
router.post("/user/register", registerUser);

// POST /api/auth/user/login
// Handle user login
router.post("/user/login", loginUser);

/**
 * DOCTOR ROUTES
 */

// POST /api/auth/doctor/register
// Handle doctor registration
router.post("/doctor/register", registerDoctor);

// POST /api/auth/doctor/login
// Handle doctor login
router.post("/doctor/login", loginDoctor);

module.exports = router;
