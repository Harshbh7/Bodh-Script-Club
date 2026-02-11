#!/usr/bin/env node

/**
 * Test script to verify event registration fix
 * Run this after deployment to verify everything works
 */

import axios from 'axios';

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

console.log('🧪 Testing Event Registration Fix');
console.log('📍 API URL:', API_URL);
console.log('');

// Test data
const testRegistration = {
  name: 'Test User',
  registrationNo: 'TEST' + Date.now(),
  phoneNumber: '9876543210',
  whatsappNumber: '9876543210',
  course: 'B.Tech CSE',
  section: 'A',
  year: '2nd',
  department: 'Computer Science'
};

async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed');
    console.log('   Status:', response.data.status);
    console.log('   Vercel:', response.data.vercel);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testGetEvents() {
  console.log('\n2️⃣ Testing Get Events...');
  try {
    const response = await axios.get(`${API_URL}/events`);
    console.log('✅ Get events passed');
    console.log('   Events found:', response.data.length);
    
    if (response.data.length > 0) {
      const event = response.data[0];
      console.log('   First event:', event.title);
      console.log('   Event ID:', event._id);
      console.log('   Event Slug:', event.slug || 'No slug');
      return event;
    }
    return null;
  } catch (error) {
    console.error('❌ Get events failed:', error.message);
    return null;
  }
}

async function testEventRegistration(event) {
  if (!event) {
    console.log('\n3️⃣ Skipping registration test (no events found)');
    return false;
  }

  console.log('\n3️⃣ Testing Event Registration...');
  console.log('   Event:', event.title);
  console.log('   Using identifier:', event.slug || event._id);
  
  try {
    const eventIdentifier = event.slug || event._id;
    const response = await axios.post(
      `${API_URL}/events/${eventIdentifier}/register`,
      testRegistration,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Registration passed');
    console.log('   Status:', response.status);
    console.log('   Message:', response.data.message);
    console.log('   Registration ID:', response.data.registration?.id);
    return true;
  } catch (error) {
    if (error.response) {
      console.error('❌ Registration failed');
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message);
      console.error('   Error:', error.response.data?.error);
    } else {
      console.error('❌ Registration failed:', error.message);
    }
    return false;
  }
}

async function testDuplicateRegistration(event) {
  if (!event) {
    console.log('\n4️⃣ Skipping duplicate test (no events found)');
    return false;
  }

  console.log('\n4️⃣ Testing Duplicate Registration Prevention...');
  
  try {
    const eventIdentifier = event.slug || event._id;
    await axios.post(
      `${API_URL}/events/${eventIdentifier}/register`,
      testRegistration,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('❌ Duplicate prevention failed (should have been rejected)');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.error === 'DUPLICATE_REGISTRATION') {
      console.log('✅ Duplicate prevention passed');
      console.log('   Correctly rejected duplicate registration');
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Event Registration Fix - Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = {
    healthCheck: false,
    getEvents: false,
    registration: false,
    duplicatePrevention: false
  };

  // Test 1: Health Check
  results.healthCheck = await testHealthCheck();
  if (!results.healthCheck) {
    console.log('\n⚠️  Health check failed. Cannot continue tests.');
    process.exit(1);
  }

  // Test 2: Get Events
  const event = await testGetEvents();
  results.getEvents = !!event;

  // Test 3: Event Registration
  if (event) {
    results.registration = await testEventRegistration(event);
    
    // Test 4: Duplicate Prevention (only if registration succeeded)
    if (results.registration) {
      results.duplicatePrevention = await testDuplicateRegistration(event);
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Test Results Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Health Check:           ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Get Events:             ${results.getEvents ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Event Registration:     ${results.registration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Duplicate Prevention:   ${results.duplicatePrevention ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n📊 Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Registration fix is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});
