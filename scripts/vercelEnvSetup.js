#!/usr/bin/env node

/**
 * Quick script to show Vercel environment variables setup
 * This script shows you exactly what to copy-paste into Vercel dashboard
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 VERCEL ENVIRONMENT VARIABLES SETUP\n');
console.log('Copy these EXACT values into your Vercel Dashboard:\n');
console.log('Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables\n');

const envVars = [
  {
    name: 'MONGODB_URI',
    value: process.env.MONGODB_URI,
    required: true
  },
  {
    name: 'JWT_SECRET',
    value: process.env.JWT_SECRET,
    required: true
  },
  {
    name: 'JWT_REFRESH_SECRET',
    value: process.env.JWT_REFRESH_SECRET,
    required: true
  },
  {
    name: 'SESSION_SECRET',
    value: process.env.SESSION_SECRET,
    required: true
  },
  {
    name: 'NODE_ENV',
    value: 'production',
    required: true
  },
  {
    name: 'BCRYPT_ROUNDS',
    value: process.env.BCRYPT_ROUNDS || '12',
    required: false
  }
];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 COPY THESE VALUES TO VERCEL DASHBOARD (Production Environment)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

envVars.forEach((envVar, index) => {
  console.log(`${index + 1}. Variable Name: ${envVar.name}`);
  console.log(`   Value: ${envVar.value || 'NOT SET IN LOCAL .env'}`);
  console.log(`   Environment: Production`);
  console.log(`   Required: ${envVar.required ? 'YES' : 'No'}`);
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 STEPS TO ADD IN VERCEL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Click on your project: bodh-script-club');
console.log('3. Click Settings → Environment Variables');
console.log('4. For each variable above:');
console.log('   - Click "Add New"');
console.log('   - Enter the Name (exactly as shown)');
console.log('   - Enter the Value (exactly as shown)');
console.log('   - Select "Production" environment');
console.log('   - Click "Save"');
console.log('5. After adding all variables, redeploy your app\n');

console.log('🧪 AFTER SETUP, TEST THESE URLS:');
console.log('• https://bodh-script-club-six.vercel.app/api/env-check');
console.log('• https://bodh-script-club-six.vercel.app/api/health');
console.log('• https://bodh-script-club-six.vercel.app/login\n');

// Check for missing variables
const missingVars = envVars.filter(v => v.required && !v.value);
if (missingVars.length > 0) {
  console.log('⚠️ WARNING: Missing required variables in local .env:');
  missingVars.forEach(v => console.log(`   - ${v.name}`));
  console.log('');
}

console.log('✅ After setup, admin login should work with:');
console.log('   Email: admin@bodhscriptclub.com');
console.log('   Password: Admin@123!');