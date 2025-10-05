#!/bin/bash

echo "🚀 VapeGuard Insurance Backend Setup Script"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew is not installed. Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install Node.js using Homebrew
    echo "📦 Installing Node.js via Homebrew..."
    brew install node
else
    echo "✅ Node.js is already installed: $(node --version)"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
else
    echo "✅ npm is available: $(npm --version)"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Installing MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community
    echo "✅ MongoDB installed. You can start it with: brew services start mongodb/brew/mongodb-community"
else
    echo "✅ MongoDB is already installed"
fi

# Create .env file from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
mkdir -p uploads/bills
echo "✅ Upload directories created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your configuration"
echo "2. Start MongoDB: brew services start mongodb/brew/mongodb-community"
echo "3. Start the development server: npm run dev"
echo ""
echo "The backend will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
