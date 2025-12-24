/**
 * Setup Verification Script
 * Checks all components, dependencies, and configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../frontend/.env.local') });

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string): void {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? passMsg : failMsg,
  });
}

function warn(name: string, message: string): void {
  results.push({
    name,
    status: 'warning',
    message,
  });
}

async function verifySetup() {
  console.log('🔍 Verifying AI Demo Setup...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Check Environment Variables
  console.log('📋 Checking Environment Variables...');
  const dailyApiKey = process.env.DAILY_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  check(
    'DAILY_API_KEY',
    !!dailyApiKey && dailyApiKey.length > 0,
    `✅ Found (${dailyApiKey ? dailyApiKey.substring(0, 10) : ''}...)`,
    '❌ Missing - Set in frontend/.env.local'
  );

  check(
    'OPENAI_API_KEY',
    !!openaiApiKey && openaiApiKey.length > 0,
    `✅ Found (${openaiApiKey ? openaiApiKey.substring(0, 10) : ''}...)`,
    '❌ Missing - Set in frontend/.env.local'
  );

  // 2. Check Required Files
  console.log('\n📁 Checking Required Files...');
  const requiredFiles = [
    { path: 'lib/dailyDialBot.ts', name: 'Daily DIAL Bot' },
    { path: 'lib/customerBot.ts', name: 'Customer Bot' },
    { path: 'lib/recordingManager.ts', name: 'Recording Manager' },
    { path: 'scripts/generateAutomatedDemo.ts', name: 'Generation Script' },
    { path: 'package.json', name: 'Package Config' },
    { path: 'tsconfig.json', name: 'TypeScript Config' },
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file.path);
    check(
      file.name,
      fs.existsSync(filePath),
      `✅ ${file.path}`,
      `❌ Missing: ${file.path}`
    );
  });

  // 3. Check Dependencies
  console.log('\n📦 Checking Dependencies...');
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const requiredDeps = ['openai', 'puppeteer', 'dotenv'];
    
    requiredDeps.forEach(dep => {
      const installed = packageJson.dependencies && packageJson.dependencies[dep];
      check(
        dep,
        !!installed,
        `✅ ${dep}@${installed}`,
        `❌ Missing - Run: npm install ${dep}`
      );
    });

    // Check if node_modules exists
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    check(
      'node_modules',
      fs.existsSync(nodeModulesPath),
      '✅ Dependencies installed',
      '❌ Run: npm install'
    );
  }

  // 4. Check Directory Structure
  console.log('\n📂 Checking Directory Structure...');
  const requiredDirs = [
    { path: 'lib', name: 'Library Directory' },
    { path: 'scripts', name: 'Scripts Directory' },
    { path: 'recordings', name: 'Recordings Directory', create: true },
    { path: 'recordings/videos', name: 'Videos Directory', create: true },
    { path: 'temp', name: 'Temp Directory', create: true },
  ];

  requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir.path);
    const exists = fs.existsSync(dirPath);
    
    if (!exists && dir.create) {
      fs.mkdirSync(dirPath, { recursive: true });
      warn(dir.name, `⚠️ Created: ${dir.path}`);
    } else {
      check(
        dir.name,
        exists,
        `✅ ${dir.path}`,
        `❌ Missing: ${dir.path}`
      );
    }
  });

  // 5. Check Frontend Integration
  console.log('\n🌐 Checking Frontend Integration...');
  const frontendFiles = [
    '../../frontend/app/demo-videos/page.tsx',
    '../../frontend/app/api/demo-recordings/route.ts',
    '../../frontend/app/api/demo-recordings/[filename]/route.ts',
  ];

  frontendFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    check(
      fileName,
      fs.existsSync(filePath),
      `✅ ${fileName}`,
      `❌ Missing: ${file}`
    );
  });

  // Print Results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Verification Results\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`);

  if (failed === 0) {
    console.log('🎉 All checks passed! System is ready.\n');
    console.log('🚀 To generate demo video, run:');
    console.log('   npm run generate-demo\n');
    console.log('🎬 To view videos, run:');
    console.log('   cd ../frontend && npm run dev');
    console.log('   Visit: http://localhost:3000/demo-videos\n');
  } else {
    console.log('⚠️ Some checks failed. Please fix the issues above.\n');
    
    if (!dailyApiKey || !openaiApiKey) {
      console.log('📝 To set API keys:');
      console.log('   1. Open: frontend/.env.local');
      console.log('   2. Add: DAILY_API_KEY=your_key');
      console.log('   3. Add: OPENAI_API_KEY=your_key\n');
    }

    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📦 To install dependencies:');
      console.log('   npm install\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
verifySetup().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
