#!/usr/bin/env node

/**
 * Script to set up Vercel environment variables
 * Run this after generating JWT secrets
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Setting up Vercel Environment Variables...\n');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Vercel CLI not found. Install it first:');
  console.log('npm i -g vercel');
  process.exit(1);
}

// Environment variables to set
const envVars = [
  {
    name: 'MONGODB_URI',
    value: process.env.MONGODB_URI,
    required: true,
    description: 'MongoDB connection string'
  },
  {
    name: 'JWT_SECRET',
    value: process.env.JWT_SECRET,
    required: true,
    description: 'JWT access token secret'
  },
  {
    name: 'JWT_REFRESH_SECRET',
    value: process.env.JWT_REFRESH_SECRET,
    required: true,
    description: 'JWT refresh token secret'
  },
  {
    name: 'SESSION_SECRET',
    value: process.env.SESSION_SECRET,
    required: true,
    description: 'Session secret'
  },
  {
    name: 'NODE_ENV',
    value: 'production',
    required: true,
    description: 'Node environment'
  },
  {
    name: 'BCRYPT_ROUNDS',
    value: process.env.BCRYPT_ROUNDS || '12',
    required: false,
    description: 'Bcrypt salt rounds'
  }
];

// Check for missing required variables
const missingVars = envVars.filter(v => v.required && !v.value);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => {
    console.error(`   - ${v.name}: ${v.description}`);
  });
  console.log('\n💡 Run: npm run generate-jwt-secrets');
  console.log('💡 Then update your .env file');
  process.exit(1);
}

// Set environment variables
console.log('📝 Setting environment variables in Vercel...\n');

for (const envVar of envVars) {
  if (!envVar.value) continue;
  
  try {
    console.log(`Setting ${envVar.name}...`);
    
    // Set for production environment
    execSync(`vercel env add ${envVar.name} production`, {
      input: envVar.value,
      stdio: ['pipe', 'pipe', 'inherit']
    });
    
    console.log(`✅ ${envVar.name} set for production`);
  } catch (error) {
    console.error(`❌ Failed to set ${envVar.name}:`, error.message);
  }
}

console.log('\n🎉 Environment variables setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Deploy your app: vercel --prod');
console.log('2. Create admin user after deployment');
console.log('3. Test your application');

console.log('\n🔍 To verify environment variables:');
console.log('vercel env ls');

console.log('\n🌐 Your app will be available at:');
console.log('https://your-app-name.vercel.app');