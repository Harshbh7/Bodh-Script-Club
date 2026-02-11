#!/usr/bin/env node

/**
 * Simple and reliable build script for Vercel
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🚀 Starting build process...');
console.log('📦 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'production');

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
    console.log('📁 Created dist directory');
  }

  // Run Vite build
  console.log('🔨 Running Vite build...');
  execSync('vite build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Verify build output
  if (existsSync('dist/index.html')) {
    console.log('✅ Build completed successfully!');
    console.log('✅ Verification: dist/index.html exists');
    process.exit(0);
  } else {
    throw new Error('Build verification failed: dist/index.html not found');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
