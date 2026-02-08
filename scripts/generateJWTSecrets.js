import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generate cryptographically secure JWT secrets
 */
function generateSecrets() {
  console.log('🔐 Generating JWT Secrets...\n');

  // Generate secrets
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(64).toString('hex');

  console.log('✅ Generated Secrets:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('JWT_SECRET=' + jwtSecret);
  console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);
  console.log('SESSION_SECRET=' + sessionSecret);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Create environment variables content
  const envContent = `# JWT Configuration - Generated ${new Date().toISOString()}
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
SESSION_SECRET=${sessionSecret}

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
`;

  // Save to file
  try {
    const secretsFile = path.join(process.cwd(), 'jwt-secrets.env');
    fs.writeFileSync(secretsFile, envContent);
    console.log('💾 Secrets saved to: jwt-secrets.env');
  } catch (error) {
    console.log('⚠️ Could not save to file, but secrets are displayed above');
  }

  console.log('📋 Copy these to your production environment variables\n');

  // Verify secret strength
  console.log('🔍 Secret Analysis:');
  console.log(`JWT Secret Length: ${jwtSecret.length} characters`);
  console.log(`Refresh Secret Length: ${jwtRefreshSecret.length} characters`);
  console.log(`Session Secret Length: ${sessionSecret.length} characters`);
  console.log(`Entropy: ~${Math.log2(Math.pow(16, 64)).toFixed(0)} bits per secret\n`);

  // Security recommendations
  console.log('🛡️ Security Recommendations:');
  console.log('1. Store these secrets securely in your environment');
  console.log('2. Never commit secrets to version control');
  console.log('3. Use different secrets for different environments');
  console.log('4. Rotate secrets periodically');
  console.log('5. Use environment variables or secure secret management\n');

  // Vercel deployment instructions
  console.log('🚀 For Vercel Deployment:');
  console.log('1. Go to your Vercel project dashboard');
  console.log('2. Navigate to Settings → Environment Variables');
  console.log('3. Add each secret as a new environment variable');
  console.log('4. Set the environment to "Production" (and "Preview" if needed)\n');

  return {
    jwtSecret,
    jwtRefreshSecret,
    sessionSecret
  };
}

/**
 * Validate existing secrets
 */
function validateExistingSecrets() {
  console.log('🔍 Validating existing secrets...\n');
  
  const secrets = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET
  };
  
  let allValid = true;
  
  for (const [name, secret] of Object.entries(secrets)) {
    if (!secret) {
      console.error(`❌ ${name} is not set`);
      allValid = false;
      continue;
    }
    
    console.log(`Checking ${name}...`);
    
    if (secret.length < 32) {
      console.error(`❌ ${name} is too short (${secret.length} chars). Minimum: 32`);
      allValid = false;
    } else if (secret.length < 64) {
      console.warn(`⚠️ ${name} is shorter than recommended (${secret.length} chars). Recommended: 64+`);
      console.log(`✅ ${name} is valid but could be stronger`);
    } else {
      console.log(`✅ ${name} is valid (${secret.length} chars)`);
    }
  }
  
  console.log('');
  
  if (allValid) {
    console.log('✅ All secrets are valid!');
  } else {
    console.log('❌ Some secrets need attention. Run this script to generate new ones.');
  }
  
  return allValid;
}

// Main execution
const command = process.argv[2];

if (command === 'validate') {
  validateExistingSecrets();
} else {
  generateSecrets();
}