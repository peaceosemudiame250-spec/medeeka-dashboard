#!/bin/bash

# MEDEEKA BACKEND SETUP SCRIPT
# This script helps you set up the backend for the first time

echo "
╔═════════════════════════════════════════╗
║   MEDEEKA BACKEND SETUP                 ║
║   Healthcare Platform Backend Setup     ║
╚═════════════════════════════════════════╝
"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  echo "📥 Download it from: https://nodejs.org"
  exit 1
fi

echo "✅ Node.js is installed"
echo "   Version: $(node --version)"

# Check if MongoDB is running
if ! nc -z localhost 27017 &> /dev/null; then
  echo ""
  echo "⚠️  WARNING: MongoDB is not running"
  echo "📝 To start MongoDB:"
  echo "   - On Mac with Homebrew: brew services start mongodb-community"
  echo "   - Or run: mongod"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✅ MongoDB is running"
fi

echo ""
echo "📦 Installing npm packages..."
echo ""

# Install dependencies
npm install

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Setup complete!"
  echo ""
  echo "🚀 To start the backend server:"
  echo "   npm run dev"
  echo ""
  echo "📡 Server will run at: http://localhost:5000"
  echo "   Health check: http://localhost:5000/api/health"
  echo ""
  echo "📚 Documentation:"
  echo "   - See README.md for API documentation"
  echo "   - See ARCHITECTURE.md for system architecture"
else
  echo ""
  echo "❌ Installation failed"
  echo "   Try running: npm install"
  exit 1
fi
