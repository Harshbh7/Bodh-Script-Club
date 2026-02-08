import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment process...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 20) {
  console.error(`❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 20 or higher.`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --production=false', { stdio: 'inherit' });

  // Run build
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify build
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('Build failed - dist/index.html not found');
  }

  console.log('✅ Build completed successfully');

  // Check for environment variables
  console.log('🔍 Checking environment configuration...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:');
    missingVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('Please set these variables in your deployment environment.');
  } else {
    console.log('✅ All required environment variables are set');
  }

  // Deployment instructions
  console.log('\n🎉 Build completed successfully!');
  console.log('\n📋 Deployment Instructions:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Vercel');
  console.log('3. Set the following environment variables in Vercel:');
  console.log('   - MONGODB_URI');
  console.log('   - JWT_SECRET');
  console.log('   - NODE_ENV=production');
  console.log('4. Deploy!');
  
  console.log('\n🔗 Useful commands:');
  console.log('   - npm run dev: Start development server');
  console.log('   - npm run build: Build for production');
  console.log('   - npm run preview: Preview production build');
  console.log('   - npm run create-admin: Create admin user');

} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}