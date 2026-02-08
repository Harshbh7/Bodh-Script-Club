#!/usr/bin/env node

/**
 * Test Vercel API endpoints
 */

import axios from 'axios';

const BASE_URL = 'https://bodh-script-club-six.vercel.app';

console.log('🧪 Testing Vercel API Endpoints...\n');

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    console.log(`Testing ${name}...`);
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 30000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }

    const response = await axios(config);
    console.log(`✅ ${name}: ${response.status} - ${response.data.message || 'OK'}`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runTests() {
  // Test 1: Environment check
  await testEndpoint('Environment Check', '/api/env-check');
  
  // Test 2: Create admin (if needed)
  console.log('\n📝 Creating admin user...');
  await testEndpoint('Create Admin', '/api/create-admin', 'POST');
  
  // Test 3: Test admin user
  console.log('\n🧪 Testing admin user...');
  await testEndpoint('Test Admin', '/api/test-admin');
  
  // Test 4: Login
  console.log('\n🔐 Testing login...');
  const loginData = {
    email: 'admin@bodhscriptclub.com',
    password: 'Admin@123!'
  };
  
  const loginResult = await testEndpoint('Admin Login', '/api/auth/login', 'POST', loginData);
  
  if (loginResult && loginResult.accessToken) {
    console.log('✅ Login successful! Token received.');
    
    // Test 5: Get user info
    console.log('\n👤 Testing user info...');
    try {
      const userResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResult.accessToken}`
        }
      });
      console.log(`✅ User Info: ${userResponse.status} - ${userResponse.data.user.name} (${userResponse.data.user.role})`);
    } catch (error) {
      console.log(`❌ User Info: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n🎉 Test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. If all tests pass, try logging in at: https://bodh-script-club-six.vercel.app/login');
  console.log('2. Use credentials: admin@bodhscriptclub.com / Admin@123!');
  console.log('3. You should be redirected to /admin after successful login');
}

runTests();