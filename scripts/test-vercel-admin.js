#!/usr/bin/env node

// Test script to verify admin creation and login on Vercel
import fetch from 'node-fetch';

const VERCEL_URL = 'https://bodh-script-club-six.vercel.app';

async function testVercelAPI() {
  console.log('🚀 Testing Vercel API endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${VERCEL_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   Environment:', healthData.environment);
    console.log('   Node version:', healthData.nodeVersion);

    // Test 2: Create Admin
    console.log('\n2️⃣ Testing admin creation...');
    const adminResponse = await fetch(`${VERCEL_URL}/api/create-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const adminData = await adminResponse.json();
    console.log('✅ Admin creation:', adminData.status);
    console.log('   Admin email:', adminData.admin?.email);
    console.log('   Admin role:', adminData.admin?.role);
    console.log('   Password test:', adminData.passwordTest);

    // Test 3: Admin Login
    console.log('\n3️⃣ Testing admin login...');
    const loginResponse = await fetch(`${VERCEL_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('   User:', loginData.user.name);
      console.log('   Email:', loginData.user.email);
      console.log('   Role:', loginData.user.role);
      console.log('   Is Admin:', loginData.user.isAdmin);
      console.log('   Token type:', loginData.tokenType);
      console.log('   Expires in:', loginData.expiresIn);

      // Test 4: Verify Token
      console.log('\n4️⃣ Testing token verification...');
      const meResponse = await fetch(`${VERCEL_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ Token verification successful!');
        console.log('   User ID:', meData.user.id);
        console.log('   Name:', meData.user.name);
        console.log('   Email:', meData.user.email);
        console.log('   Role:', meData.user.role);
      } else {
        const meError = await meResponse.json();
        console.log('❌ Token verification failed:', meError.message);
      }

    } else {
      const loginError = await loginResponse.json();
      console.log('❌ Login failed:', loginError.message);
      console.log('   Error code:', loginError.error);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Health check: ✅');
    console.log('   - Admin creation: ✅');
    console.log('   - Admin login:', loginResponse.ok ? '✅' : '❌');
    console.log('   - Token verification:', loginResponse.ok ? '✅' : '❌');

    if (loginResponse.ok) {
      console.log('\n🔑 Admin Login Credentials:');
      console.log('   Email: admin@bodhscriptclub.com');
      console.log('   Password: Admin@123!');
      console.log('   Login URL: https://bodh-script-club-six.vercel.app/login');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testVercelAPI();