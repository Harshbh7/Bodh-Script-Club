#!/usr/bin/env node

/**
 * Test admin login functionality
 * This script tests the complete admin login flow
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🧪 Testing Admin Login Flow...\n');
console.log('📡 API URL:', API_URL);

async function testAdminLogin() {
  try {
    // Test 1: Check API health
    console.log('1️⃣ Testing API health...');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log('✅ API Health:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ API Health failed:', error.message);
      return;
    }

    // Test 2: Test admin user existence
    console.log('\n2️⃣ Testing admin user...');
    try {
      const adminTestResponse = await axios.post(`${API_URL}/auth/test-admin`);
      console.log('✅ Admin Test:', adminTestResponse.data.message);
      console.log('👤 Admin Email:', adminTestResponse.data.admin.email);
      console.log('🔑 Password Test:', adminTestResponse.data.passwordTest.isMatch ? 'PASS' : 'FAIL');
      console.log('🔐 JWT Secret:', adminTestResponse.data.jwtTest.secretAvailable ? 'Available' : 'Missing');
    } catch (error) {
      console.log('❌ Admin Test failed:', error.response?.data?.message || error.message);
      return;
    }

    // Test 3: Attempt admin login
    console.log('\n3️⃣ Testing admin login...');
    const loginData = {
      email: 'admin@bodhscriptclub.com',
      password: 'Admin@123!'
    };

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
      console.log('✅ Login successful!');
      console.log('👤 User:', loginResponse.data.user.name);
      console.log('🔑 Role:', loginResponse.data.user.role);
      console.log('👑 Is Admin:', loginResponse.data.user.isAdmin);
      console.log('🎫 Token Type:', loginResponse.data.tokenType);
      console.log('⏰ Expires In:', loginResponse.data.expiresIn);

      // Test 4: Verify token works
      console.log('\n4️⃣ Testing token verification...');
      const token = loginResponse.data.accessToken;
      
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Token verification successful!');
        console.log('👤 Authenticated as:', meResponse.data.user.name);
        console.log('🔑 Role:', meResponse.data.user.role);
      } catch (error) {
        console.log('❌ Token verification failed:', error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      console.log('🔍 Error details:', error.response?.data);
    }

    console.log('\n🎉 Admin login test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminLogin();