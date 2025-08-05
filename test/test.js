#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_DIR = path.join(__dirname, 'test-repo');
const TEST_ENV_FILE = path.join(TEST_DIR, '.env');
const TEST_SAFE_FILE = path.join(TEST_DIR, '.env.example');

function runTest(name, testFn) {
  console.log(`🧪 Running test: ${name}`);
  try {
    testFn();
    console.log(`✅ ${name} passed`);
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
    throw error;
  }
}

function setupTestRepo() {
  // Clean up previous test
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  
  // Create test directory
  fs.mkdirSync(TEST_DIR, { recursive: true });
  
  // Initialize git repo
  execSync('git init', { cwd: TEST_DIR, stdio: 'ignore' });
  
  // Create test files
  fs.writeFileSync(TEST_ENV_FILE, 'SECRET=123\nAPI_KEY=abc123');
  fs.writeFileSync(TEST_SAFE_FILE, 'SECRET=example\nAPI_KEY=example');
  
  console.log('📁 Test repository created');
}

function testSecretDetection() {
  // Add the secret file
  execSync('git add .env', { cwd: TEST_DIR, stdio: 'ignore' });
  
  // Try to run the check (should fail)
  try {
    execSync('node ../../lib/checkSecrets.js', { cwd: TEST_DIR, stdio: 'pipe' });
    throw new Error('Should have detected secrets');
  } catch (e) {
    if (e.status === 1) {
      console.log('✅ Secret detection working');
    } else {
      throw e;
    }
  }
}

function testSafeFileDetection() {
  // Remove the secret file and add safe file
  execSync('git reset', { cwd: TEST_DIR, stdio: 'ignore' });
  execSync('git add .env.example', { cwd: TEST_DIR, stdio: 'ignore' });
  
  // Run the check (should pass)
  execSync('node ../../lib/checkSecrets.js', { cwd: TEST_DIR, stdio: 'pipe' });
  console.log('✅ Safe file detection working');
}

function testNoSecrets() {
  // Remove all files
  execSync('git reset', { cwd: TEST_DIR, stdio: 'ignore' });
  
  // Run the check (should pass)
  execSync('node ../../lib/checkSecrets.js', { cwd: TEST_DIR, stdio: 'pipe' });
  console.log('✅ No secrets detection working');
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

// Run tests
console.log('🚀 Starting tests...\n');

try {
  setupTestRepo();
  
  runTest('Secret Detection', testSecretDetection);
  runTest('Safe File Detection', testSafeFileDetection);
  runTest('No Secrets Detection', testNoSecrets);
  
  console.log('\n🎉 All tests passed!');
} catch (error) {
  console.error('\n💥 Tests failed:', error.message);
  process.exit(1);
} finally {
  cleanup();
} 