#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 VapeGuard Insurance Backend Test Suite');
console.log('==========================================\n');

// Test categories
const testSuites = {
  unit: [
    'tests/models/Application.test.js',
    'tests/validators/applicationValidator.test.js',
    'tests/middleware/validation.test.js',
    'tests/middleware/errorHandler.test.js'
  ],
  integration: [
    'tests/routes/application.test.js',
    'tests/routes/upload.test.js',
    'tests/routes/payment.test.js',
    'tests/routes/insurance.test.js'
  ],
  e2e: [
    'tests/integration/application-flow.test.js'
  ]
};

function runTests(category, files) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Running ${category.toUpperCase()} tests...`);
    console.log('─'.repeat(50));

    const jest = spawn('npx', ['jest', '--verbose', '--coverage', ...files], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${category.toUpperCase()} tests passed!`);
        resolve();
      } else {
        console.log(`\n❌ ${category.toUpperCase()} tests failed!`);
        reject(new Error(`${category} tests failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error(`\n❌ Error running ${category} tests:`, error);
      reject(error);
    });
  });
}

async function runAllTests() {
  try {
    // Check if we should run specific test category
    const category = process.argv[2];
    
    if (category && testSuites[category]) {
      await runTests(category, testSuites[category]);
    } else if (category === 'all' || !category) {
      // Run all test categories
      for (const [testCategory, files] of Object.entries(testSuites)) {
        await runTests(testCategory, files);
      }
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\n📊 Coverage report generated in coverage/ directory');
    } else {
      console.log('❌ Invalid test category. Available options:');
      console.log('  - unit: Model and validator tests');
      console.log('  - integration: API route tests');
      console.log('  - e2e: End-to-end flow tests');
      console.log('  - all: Run all tests (default)');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test run interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Test run terminated');
  process.exit(0);
});

runAllTests();
