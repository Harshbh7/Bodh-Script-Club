// Professional admin creation serverless function
import connectDB from '../lib/db.js';
import User from '../models/UserModel.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectDB();

    // Admin credentials
    const adminData = {
      name: 'Admin',
      email: 'admin@bodhscriptclub.com',
      password: 'Admin@123!',
      role: 'admin',
      isAdmin: true,
      registrationNumber: 'ADMIN001',
      stream: 'Administration',
      session: '2024-25',
      phone: '+91-9999999999',
      section: 'ADMIN'
    };

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      // Test password to verify it works
      const passwordMatch = await existingAdmin.comparePassword('Admin@123!');
      
      return res.status(200).json({
        status: 'exists',
        message: 'Admin user already exists',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          isAdmin: existingAdmin.isAdmin,
          createdAt: existingAdmin.createdAt
        },
        passwordTest: passwordMatch ? 'PASS' : 'FAIL',
        credentials: {
          email: 'admin@bodhscriptclub.com',
          password: 'Admin@123!'
        },
        loginUrl: 'https://bodh-script-club-six.vercel.app/login'
      });
    }

    // Create new admin
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');

    res.status(201).json({
      status: 'created',
      message: 'Admin user created successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isAdmin: admin.isAdmin,
        createdAt: admin.createdAt
      },
      credentials: {
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      },
      loginUrl: 'https://bodh-script-club-six.vercel.app/login'
    });

  } catch (error) {
    console.error('❌ Create admin error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin user already exists',
        error: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create admin user',
      error: error.message
    });
  }
}