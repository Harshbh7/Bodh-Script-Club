import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/UserModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function createAdmin() {
  try {
    console.log('🔐 Creating Admin User...\n');
    console.log('🔧 Environment Check:');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'NOT SET');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'NOT SET');
    console.log('');

    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is required');
      console.log('💡 Please check your .env file');
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is required');
      console.log('💡 Run: npm run generate-jwt-secrets');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    console.log('🔗 URI:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Admin credentials
    const adminData = {
      name: 'Admin',
      email: 'admin@bodhscriptclub.com',
      password: 'Admin@123!', // Strong default password
      role: 'admin',
      isAdmin: true,
      registrationNumber: 'ADMIN001',
      stream: 'Administration',
      session: '2024-25',
      phone: '+91-9999999999',
      section: 'ADMIN'
    };

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      
      // Ask if user wants to update password
      console.log('\n💡 To update admin password, delete the existing admin and run this script again.');
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save hook)
    console.log('👤 Creating admin user...');
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', adminData.name);
    console.log('🏷️ Role:', adminData.role);
    console.log('🆔 Registration:', adminData.registrationNumber);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🚨 IMPORTANT SECURITY NOTES:');
    console.log('1. ⚠️ Change the password after first login');
    console.log('2. 🔒 Use a strong, unique password');
    console.log('3. 🛡️ Enable 2FA if available');
    console.log('4. 📝 Store credentials securely');
    console.log('5. 🚫 Never share admin credentials\n');
    
    console.log('🌐 LOGIN INSTRUCTIONS:');
    console.log('1. Go to your application URL');
    console.log('2. Navigate to /login');
    console.log('3. Use the credentials above');
    console.log('4. You will be redirected to /admin automatically\n');
    
    console.log('🔧 ADMIN FEATURES:');
    console.log('• Manage join requests');
    console.log('• Create and manage events');
    console.log('• Manage team members');
    console.log('• Review testimonials');
    console.log('• Manage gallery');
    console.log('• Export data to Excel\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    console.error('📋 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 11000) {
      console.log('💡 Admin user already exists with this email');
    } else if (error.name === 'ValidationError') {
      console.log('💡 Validation error:', error.message);
    } else if (error.name === 'MongoServerSelectionError') {
      console.log('💡 Cannot connect to MongoDB. Check your connection string and network.');
    } else if (error.name === 'MongoTimeoutError') {
      console.log('💡 MongoDB connection timeout. Check your network connection.');
    } else {
      console.log('💡 Check your MongoDB connection and try again');
      console.log('🔍 Full error:', error);
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log('📤 Disconnected from MongoDB');
    } catch (disconnectError) {
      console.log('⚠️ Error disconnecting:', disconnectError.message);
    }
    process.exit(0);
  }
}

// Run if called directly
console.log('🚀 Script starting...');

// More reliable way to check if script is called directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('createAdmin.js');

console.log('📁 Script path:', import.meta.url);
console.log('📁 Process argv[1]:', process.argv[1]);
console.log('📁 Is main module:', isMainModule);

if (isMainModule) {
  console.log('✅ Running createAdmin function...');
  createAdmin();
} else {
  console.log('⚠️ Script not called directly, skipping execution');
}

export default createAdmin;