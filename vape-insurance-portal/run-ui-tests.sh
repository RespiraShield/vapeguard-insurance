#!/bin/bash

echo "🧪 Running VapeGuard Frontend UI Tests..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the vape-insurance-portal directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the tests with verbose output
echo "🚀 Starting UI tests..."
echo ""

# Run tests with coverage and watch mode
npm test -- --coverage --watchAll=false --verbose

echo ""
echo "✅ UI tests completed!"
echo ""
echo "📊 Test Results Summary:"
echo "   - Check the output above for test results"
echo "   - Look for any failing tests that need fixing"
echo "   - Tests will show exactly what's rendering vs what should render"
echo ""
echo "🔍 To debug specific tests:"
echo "   npm test -- --testNamePattern='should render the main header'"
echo ""
echo "📱 To test responsive design:"
echo "   - Open browser dev tools"
echo "   - Toggle device toolbar"
echo "   - Test different screen sizes"
