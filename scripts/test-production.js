#!/usr/bin/env node

/**
 * Professional production test script
 */

import axios from 'axios';

const BASE_URL = 'https://bodh-script-club-six.vercel.app';

console.log('🧪 PROFESSIONAL PRODUCTION TEST');
console.log('================================\n');

async function testProduction() {
  try {
    // Test 1: Create Admin
    console.log('1️⃣ Testing admin creation...');
    try {
      const adminResponse = await axios.get(`${BASE_URL}/api/create-admin`);
      console.log('✅ Admin Status:', adminResponse.data.status);
      console.log('📧 Admin Email:', adminResponse.data.admin.email);
      console.log('🔑 Password Test:', adminResponse.data.passwordTest);
    } catch (error) {
      console.log('❌ Admin creation failed:', error.response?.data?.message || error.message);
      return;
    }

    // Test 2: Login
    console.log('\n2️⃣ Testing login...');
    const loginData = {
      email: 'admin@bodhscriptclub.com',
      password: 'Admin@123!'
    };

    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
      console.log('✅ Login Status:', loginResponse.data.message);
      console.log('👤 User:', loginResponse.data.user.name);
      console.log('🔑 Role:', loginResponse.data.user.role);
      console.log('👑 Is Admin:', loginResponse.data.user.isAdmin);
      console.log('🎫 Token:', loginResponse.data.accessToken ? 'Generated' : 'Missing');
      
      console.log('\n🎉 SUCCESS! Login is working perfectly!');
      console.log('\n📋 CREDENTIALS:');
      console.log('Email: admin@bodhscriptclub.com');
      console.log('Password: Admin@123!');
      console.log('\n🌐 LOGIN URL:');
      console.log('https://bodh-script-club-six.vercel.app/login');
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      console.log('🔍 Error details:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProduction();