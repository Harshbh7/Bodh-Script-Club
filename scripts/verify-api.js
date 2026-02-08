#!/usr/bin/env node

/**
 * Verify API functions are properly structured for Vercel
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying API functions for Vercel deployment...\n');

const apiFiles = [
  'api/health.js',
  'api/env-check.js',
  'api/create-admin.js',
  'api/test-admin.js',
  'api/auth/login.js',
  'api/auth/me.js'
];

let allValid = true;

for (const file of apiFiles) {
  console.log(`Checking ${file}...`);
  
  if (!existsSync(file)) {
    console.log(`❌ File not found: ${file}`);
    allValid = false;
    continue;
  }
  
  try {
    const content = readFileSync(file, 'utf8');
    
    // Check for default export
    if (!content.includes('export default')) {
      console.log(`❌ Missing default export in ${file}`);
      allValid = false;
      continue;
    }
    
    // Check for handler function
    if (!content.includes('function handler') && !content.includes('(req, res)')) {
      console.log(`❌ Missing handler function in ${file}`);
      allValid = false;
      continue;
    }
    
    // Check for CORS headers
    if (!content.includes('Access-Control-Allow-Origin')) {
      console.log(`⚠️ Missing CORS headers in ${file}`);
    }
    
    console.log(`✅ ${file} is valid`);
    
  } catch (error) {
    console.log(`❌ Error reading ${file}: ${error.message}`);
    allValid = false;
  }
}

console.log('\n📋 Verification Summary:');
if (allValid) {
  console.log('✅ All API functions are properly structured for Vercel');
  console.log('🚀 Ready for deployment!');
} else {
  console.log('❌ Some API functions have issues');
  console.log('🔧 Please fix the issues above before deploying');
}

console.log('\n📝 Next steps after deployment:');
console.log('1. Set environment variables in Vercel Dashboard');
console.log('2. Test: https://your-app.vercel.app/api/health');
console.log('3. Test: https://your-app.vercel.app/api/env-check');
console.log('4. Create admin: https://your-app.vercel.app/api/create-admin');
console.log('5. Login: https://your-app.vercel.app/login');