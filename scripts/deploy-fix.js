#!/usr/bin/env node

/**
 * Professional deployment fix script
 * This ensures proper deployment of both frontend and API
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Professional Deployment Fix');
console.log('==============================\n');

async function deployFix() {
  try {
    // Step 1: Verify API structure
    console.log('1️⃣ Verifying API structure...');
    const requiredFiles = [
      'api/create-admin.js',
      'api/auth/login.js',
      'api/health.js',
      'vercel.json'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    console.log('✅ API structure verified\n');

    // Step 2: Build frontend
    console.log('2️⃣ Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully\n');

    // Step 3: Deploy to Vercel
    console.log('3️⃣ Deploying to Vercel...');
    execSync('vercel --prod --yes', { stdio: 'inherit' });
    console.log('✅ Deployment completed\n');

    // Step 4: Verification instructions
    console.log('4️⃣ VERIFICATION STEPS:');
    console.log('After deployment completes, test these URLs:');
    console.log('');
    console.log('🔍 API Health Check:');
    console.log('   https://bodh-script-club-six.vercel.app/api/health');
    console.log('   Expected: {"status": "OK"}');
    console.log('');
    console.log('👤 Create Admin:');
    console.log('   https://bodh-script-club-six.vercel.app/api/create-admin');
    console.log('   Expected: Admin user created/exists');
    console.log('');
    console.log('🔐 Test Login:');
    console.log('   https://bodh-script-club-six.vercel.app/login');
    console.log('   Credentials: admin@bodhscriptclub.com / Admin@123!');
    console.log('');

    console.log('🎉 DEPLOYMENT FIX COMPLETED!');
    console.log('Your admin login should now work properly.');

  } catch (error) {
    console.error('❌ Deployment fix failed:', error.message);
    console.log('\n🔧 Manual steps:');
    console.log('1. Run: vercel --prod');
    console.log('2. Test: https://bodh-script-club-six.vercel.app/api/health');
    console.log('3. Create admin: https://bodh-script-club-six.vercel.app/api/create-admin');
    process.exit(1);
  }
}

deployFix();