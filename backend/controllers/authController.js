/**
 * AUTHENTICATION CONTROLLER
 *
 * This file contains all the logic for user registration and login
 * Think of it as the "business logic" - it decides what happens when someone registers or logs in
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

/**
 * HELPER FUNCTION: Generate JWT Token
 *
 * JWT = JSON Web Token
 * It's like a digital ID card that proves the user is logged in
 * Frontend stores this and sends it with each request
 */
const generateToken = (id, userType) => {
  // jwt.sign creates a token that expires in 7 days
  return jwt.sign(
    { id, userType }, // Data inside the token
    process.env.JWT_SECRET, // Secret key to sign it (from .env)
    { expiresIn: "7d" }, // Token expires after 7 days
  );
};

/**
 * PATIENT REGISTRATION
 * POST /api/auth/patient/register
 */
exports.registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      emergencyContact,
      bloodGroup,
      knownConditions,
      allergies,
    } = req.body;

    // Step 1: Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !phoneNumber ||
      !dateOfBirth ||
      !gender ||
      !emergencyContact
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Step 2: Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Step 3: Create new patient
    const user = await User.create({
      fullName,
      email,
      password, // Will be hashed by pre-save middleware
      phoneNumber,
      dateOfBirth,
      gender,
      emergencyContact,
      bloodGroup: bloodGroup || "",
      knownConditions: knownConditions || "",
      allergies: allergies || "",
    });

    // Step 4: Generate token
    const token = generateToken(user._id, "user");

    // Step 5: Return success response
    res.status(201).json({
      success: true,
      token,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("User Registration Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error registering user",
    });
  }
};

/**
 * PATIENT LOGIN
 * POST /api/auth/patient/login
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Step 2: Find patient by email
    // .select('+password') includes password (normally hidden for security)
    const user = await User.findOne({ email }).select("+password");

    // Step 3: Check if patient exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 4: Check if password is correct
    // comparePassword uses bcryptjs to compare plain password with hashed version
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 5: Generate token
    const token = generateToken(user._id, "user");

    // Step 6: Return success response
    res.status(200).json({
      success: true,
      token,
      message: "User logged in successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("User Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error logging in",
    });
  }
};

/**
 * DOCTOR REGISTRATION
 * POST /api/auth/doctor/register
 */
exports.registerDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      specialization,
      customSpecialization,
      medicalLicenseNumber,
      hospital,
    } = req.body;

    // Step 1: Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !phoneNumber ||
      !specialization ||
      !medicalLicenseNumber ||
      !hospital
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Step 2: Check if email already exists
    let existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Step 3: Check if medical license already exists
    let existingLicense = await Doctor.findOne({ medicalLicenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "Medical license number already registered",
      });
    }

    // Step 4: Create new doctor
    const doctor = await Doctor.create({
      fullName,
      email,
      password, // Will be hashed by pre-save middleware
      phoneNumber,
      specialization,
      customSpecialization: customSpecialization || "",
      medicalLicenseNumber,
      hospital,
    });

    // Step 5: Generate token
    const token = generateToken(doctor._id, "doctor");

    // Step 6: Return success response
    res.status(201).json({
      success: true,
      token,
      message: "Doctor registered successfully",
      user: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor Registration Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error registering doctor",
    });
  }
};

/**
 * DOCTOR LOGIN
 * POST /api/auth/doctor/login
 */
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Step 2: Find doctor by email (include password)
    const doctor = await Doctor.findOne({ email }).select("+password");

    // Step 3: Check if doctor exists
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 4: Check if password is correct
    const isPasswordValid = await doctor.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 5: Generate token
    const token = generateToken(doctor._id, "doctor");

    // Step 6: Return success response
    res.status(200).json({
      success: true,
      token,
      message: "Doctor logged in successfully",
      user: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error logging in",
    });
  }
};
