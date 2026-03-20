/**
 * DOCTOR MODEL
 *
 * This defines the structure of doctor data in the database
 * Extends patient info with medical credentials
 */

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const doctorSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },

  // Contact Information
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
  },

  // Medical Credentials
  specialization: {
    type: String,
    required: [true, "Specialization is required"],
  },
  customSpecialization: {
    // For when doctor selects "Other"
    type: String,
    default: "",
  },
  medicalLicenseNumber: {
    type: String,
    required: [true, "Medical license number is required"],
    unique: true, // Each doctor has unique license
  },
  hospital: {
    type: String,
    required: [true, "Hospital/Clinic name is required"],
  },

  // Account Management
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  licenseVerified: {
    type: Boolean,
    default: false, // Admin must verify medical license
  },
});

/**
 * PRE-SAVE MIDDLEWARE
 * Hash password before saving
 */
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * METHODS
 */

// Compare entered password with stored hashed password
doctorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Doctor", doctorSchema);
