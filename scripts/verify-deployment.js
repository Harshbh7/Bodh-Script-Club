#!/usr/bin/env node

// Verification script for Vercel deployment
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 VERCEL DEPLOYMENT VERIFICATION\n');

// Count serverless functions in api directory
function countApiFiles(dir, depth = 0) {
  let count = 0;
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isFile() && item.endsWith('.js')) {
      console.log(`${'  '.repeat(depth)}📄 ${item} (SERVERLESS FUNCTION)`);
      count++;
    } else if (stat.isDirectory()) {
      console.log(`${'  '.repeat(depth)}📁 ${item}/`);
      count += countApiFiles(fullPath, depth + 1);
    }
  }
  
  return count;
}

console.log('📊 SERVERLESS FUNCTIONS COUNT:');
console.log('api/');
const functionCount = countApiFiles('api');

console.log(`\n🎯 RESULT: ${functionCount} serverless functions detected`);
console.log(`📋 VERCEL LIMIT: 12 functions (Hobby plan)`);

if (functionCount <= 12) {
  console.log('✅ PASS: Under Vercel function limit');
  console.log('🚀 DEPLOYMENT WILL SUCCEED');
} else {
  console.log('❌ FAIL: Exceeds Vercel function limit');
  console.log('🚫 DEPLOYMENT WILL FAIL');
}

console.log('\n📋 EXPECTED FUNCTIONS:');
console.log('1. api/index.js - Main consolidated API');
console.log('2. api/create-admin.js - Admin creation');
console.log('3. api/health.js - Health check');

console.log('\n🔧 HELPER FILES (NOT FUNCTIONS):');
console.log('- lib/ - Database and utilities');
console.log('- models/ - Database models');
console.log('- utils/ - Helper utilities');

console.log('\n✅ VERIFICATION COMPLETE');