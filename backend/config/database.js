/**
 * DATABASE CONNECTION FILE
 *
 * This file handles the connection to MongoDB
 * Think of it as the "bridge" between your app and the database
 */

const mongoose = require("mongoose");

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // MONGODB_URI should be set in .env (e.g., mongodb://localhost:27017/medeeka)
    // If not set, server continues without DB (for local UI testing only)
    if (!process.env.MONGODB_URI) {
      console.warn(
        "⚠️  MONGODB_URI not set. Running without database. Diagnosis records will not persist.",
      );
      return null;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(
      `⚠️  Could not connect to MongoDB: ${error.message}. Server running without database.`,
    );
    return null;
  }
};

module.exports = connectDB;
