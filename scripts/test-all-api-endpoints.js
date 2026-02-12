// Comprehensive API Test Script for Vercel Deployment
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';
let adminToken = null;
let testEventId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`Testing: ${name}`, 'blue');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (adminToken && !options.noAuth) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return { status: 0, data: null, ok: false, error: error.message };
  }
}

// Test 1: Health Check
async function testHealth() {
  logTest('Health Check');
  const result = await makeRequest('/health', { noAuth: true });
  
  if (result.ok && result.data.status === 'OK') {
    log('✅ Health check passed', 'green');
    log(`   MongoDB: ${result.data.mongodb}`, 'cyan');
    return true;
  } else {
    log('❌ Health check failed', 'red');
    return false;
  }
}

// Test 2: Admin Login
async function testAdminLogin() {
  logTest('Admin Login');
  
  const credentials = {
    email: process.env.ADMIN_EMAIL || 'admin@bodhscript.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  };

  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    noAuth: true
  });

  if (result.ok && result.data.token) {
    adminToken = result.data.token;
    log('✅ Admin login successful', 'green');
    log(`   User: ${result.data.user.name} (${result.data.user.email})`, 'cyan');
    log(`   Admin: ${result.data.user.isAdmin}`, 'cyan');
    return true;
  } else {
    log('❌ Admin login failed', 'red');
    log(`   Status: ${result.status}`, 'yellow');
    log(`   Message: ${result.data?.message || 'Unknown error'}`, 'yellow');
    return false;
  }
}

// Test 3: Get Events
async function testGetEvents() {
  logTest('Get Events');
  const result = await makeRequest('/events', { noAuth: true });

  if (result.ok && Array.isArray(result.data)) {
    log(`✅ Fetched ${result.data.length} events`, 'green');
    if (result.data.length > 0) {
      testEventId = result.data[0]._id;
      log(`   First event: ${result.data[0].title}`, 'cyan');
    }
    return true;
  } else {
    log('❌ Failed to fetch events', 'red');
    return false;
  }
}

// Test 4: Create Event (Admin)
async function testCreateEvent() {
  logTest('Create Event (Admin)');
  
  const newEvent = {
    title: `Test Event ${Date.now()}`,
    description: 'This is a test event created by automated testing',
    shortDescription: 'Test event for API validation',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    location: 'Test Location',
    eventType: 'workshop',
    status: 'upcoming',
    isPaid: false,
    maxAttendees: 50
  };

  const result = await makeRequest('/events', {
    method: 'POST',
    body: JSON.stringify(newEvent)
  });

  if (result.ok && result.data._id) {
    testEventId = result.data._id;
    log('✅ Event created successfully', 'green');
    log(`   Event ID: ${result.data._id}`, 'cyan');
    log(`   Title: ${result.data.title}`, 'cyan');
    log(`   Slug: ${result.data.slug}`, 'cyan');
    return true;
  } else {
    log('❌ Failed to create event', 'red');
    log(`   Status: ${result.status}`, 'yellow');
    log(`   Message: ${result.data?.message || 'Unknown error'}`, 'yellow');
    return false;
  }
}

// Test 5: Update Event (Admin)
async function testUpdateEvent() {
  logTest('Update Event (Admin)');
  
  if (!testEventId) {
    log('⚠️  No test event ID available, skipping', 'yellow');
    return false;
  }

  const updates = {
    description: 'Updated description for testing',
    maxAttendees: 100
  };

  const result = await makeRequest(`/events/${testEventId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });

  if (result.ok && result.data._id) {
    log('✅ Event updated successfully', 'green');
    log(`   Max Attendees: ${result.data.maxAttendees}`, 'cyan');
    return true;
  } else {
    log('❌ Failed to update event', 'red');
    return false;
  }
}

// Test 6: Event Registration (Public)
async function testEventRegistration() {
  logTest('Event Registration (Public)');
  
  if (!testEventId) {
    log('⚠️  No test event ID available, skipping', 'yellow');
    return false;
  }

  const registration = {
    name: 'Test Student',
    registrationNo: `TEST${Date.now()}`,
    phoneNumber: '9876543210',
    whatsappNumber: '9876543210',
    course: 'B.Tech',
    section: 'A',
    year: '2nd',
    department: 'Computer Science'
  };

  const result = await makeRequest(`/events/${testEventId}/register`, {
    method: 'POST',
    body: JSON.stringify(registration),
    noAuth: true
  });

  if (result.ok && result.data.success) {
    log('✅ Event registration successful', 'green');
    log(`   Registration ID: ${result.data.registration.id}`, 'cyan');
    return true;
  } else {
    log('❌ Event registration failed', 'red');
    log(`   Status: ${result.status}`, 'yellow');
    log(`   Message: ${result.data?.message || 'Unknown error'}`, 'yellow');
    return false;
  }
}

// Test 7: Duplicate Registration Check
async function testDuplicateRegistration() {
  logTest('Duplicate Registration Check');
  
  if (!testEventId) {
    log('⚠️  No test event ID available, skipping', 'yellow');
    return false;
  }

  const registration = {
    name: 'Test Student',
    registrationNo: `TEST${Date.now() - 1000}`,
    phoneNumber: '9876543210',
    whatsappNumber: '9876543210',
    course: 'B.Tech',
    section: 'A',
    year: '2nd',
    department: 'Computer Science'
  };

  // First registration
  await makeRequest(`/events/${testEventId}/register`, {
    method: 'POST',
    body: JSON.stringify(registration),
    noAuth: true
  });

  // Duplicate registration
  const result = await makeRequest(`/events/${testEventId}/register`, {
    method: 'POST',
    body: JSON.stringify(registration),
    noAuth: true
  });

  if (!result.ok && result.status === 400 && result.data.error === 'DUPLICATE_REGISTRATION') {
    log('✅ Duplicate registration correctly prevented', 'green');
    return true;
  } else {
    log('❌ Duplicate registration check failed', 'red');
    return false;
  }
}

// Test 8: Get Event Registrations (Admin)
async function testGetEventRegistrations() {
  logTest('Get Event Registrations (Admin)');
  
  if (!testEventId) {
    log('⚠️  No test event ID available, skipping', 'yellow');
    return false;
  }

  const result = await makeRequest(`/events/${testEventId}/registrations`);

  if (result.ok && Array.isArray(result.data)) {
    log(`✅ Fetched ${result.data.length} registrations`, 'green');
    return true;
  } else {
    log('❌ Failed to fetch registrations', 'red');
    return false;
  }
}

// Test 9: Get Members
async function testGetMembers() {
  logTest('Get Members');
  const result = await makeRequest('/members', { noAuth: true });

  if (result.ok && Array.isArray(result.data)) {
    log(`✅ Fetched ${result.data.length} members`, 'green');
    return true;
  } else {
    log('❌ Failed to fetch members', 'red');
    return false;
  }
}

// Test 10: Add Member (Admin)
async function testAddMember() {
  logTest('Add Member (Admin)');
  
  const newMember = {
    name: `Test Member ${Date.now()}`,
    role: 'developer',
    bio: 'Test member for API validation',
    order: 999
  };

  const result = await makeRequest('/members', {
    method: 'POST',
    body: JSON.stringify(newMember)
  });

  if (result.ok && result.data._id) {
    log('✅ Member added successfully', 'green');
    log(`   Member ID: ${result.data._id}`, 'cyan');
    log(`   Name: ${result.data.name}`, 'cyan');
    return true;
  } else {
    log('❌ Failed to add member', 'red');
    return false;
  }
}

// Test 11: Submit Join Request
async function testSubmitJoinRequest() {
  logTest('Submit Join Request');
  
  const submission = {
    name: 'Test Applicant',
    email: `test${Date.now()}@example.com`,
    registrationNumber: `REG${Date.now()}`,
    phone: '9876543210',
    whatsapp: '9876543210',
    course: 'B.Tech',
    section: 'A',
    year: '2nd',
    batch: '2023-2027',
    github: 'https://github.com/testuser'
  };

  const result = await makeRequest('/submissions', {
    method: 'POST',
    body: JSON.stringify(submission),
    noAuth: true
  });

  if (result.ok && result.data.success) {
    log('✅ Join request submitted successfully', 'green');
    return true;
  } else {
    log('❌ Failed to submit join request', 'red');
    return false;
  }
}

// Test 12: Get Submissions (Admin)
async function testGetSubmissions() {
  logTest('Get Submissions (Admin)');
  const result = await makeRequest('/submissions');

  if (result.ok && Array.isArray(result.data)) {
    log(`✅ Fetched ${result.data.length} submissions`, 'green');
    return true;
  } else {
    log('❌ Failed to fetch submissions', 'red');
    return false;
  }
}

// Test 13: Get Testimonials
async function testGetTestimonials() {
  logTest('Get Testimonials');
  const result = await makeRequest('/testimonials', { noAuth: true });

  if (result.ok && Array.isArray(result.data)) {
    log(`✅ Fetched ${result.data.length} approved testimonials`, 'green');
    return true;
  } else {
    log('❌ Failed to fetch testimonials', 'red');
    return false;
  }
}

// Test 14: Submit Testimonial
async function testSubmitTestimonial() {
  logTest('Submit Testimonial');
  
  const testimonial = {
    name: 'Test User',
    role: 'Student',
    message: 'This is a test testimonial for API validation',
    rating: 5
  };

  const result = await makeRequest('/testimonials/submit', {
    method: 'POST',
    body: JSON.stringify(testimonial),
    noAuth: true
  });

  if (result.ok) {
    log('✅ Testimonial submitted successfully', 'green');
    return true;
  } else {
    log('❌ Failed to submit testimonial', 'red');
    return false;
  }
}

// Test 15: Get Gallery
async function testGetGallery() {
  logTest('Get Gallery');
  const result = await makeRequest('/gallery', { noAuth: true });

  if (result.ok && Array.isArray(result.data)) {
    log(`✅ Fetched ${result.data.length} gallery items`, 'green');
    return true;
  } else {
    log('❌ Failed to fetch gallery', 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     BODH SCRIPT CLUB - API COMPREHENSIVE TEST SUITE      ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTesting API at: ${BASE_URL}\n`, 'yellow');

  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Get Events', fn: testGetEvents },
    { name: 'Create Event', fn: testCreateEvent },
    { name: 'Update Event', fn: testUpdateEvent },
    { name: 'Event Registration', fn: testEventRegistration },
    { name: 'Duplicate Registration Check', fn: testDuplicateRegistration },
    { name: 'Get Event Registrations', fn: testGetEventRegistrations },
    { name: 'Get Members', fn: testGetMembers },
    { name: 'Add Member', fn: testAddMember },
    { name: 'Submit Join Request', fn: testSubmitJoinRequest },
    { name: 'Get Submissions', fn: testGetSubmissions },
    { name: 'Get Testimonials', fn: testGetTestimonials },
    { name: 'Submit Testimonial', fn: testSubmitTestimonial },
    { name: 'Get Gallery', fn: testGetGallery }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      log(`❌ Test "${test.name}" threw an error: ${error.message}`, 'red');
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      TEST SUMMARY                         ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });

  console.log('');
  log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`, 'yellow');
  
  if (failed === 0) {
    log('\n🎉 All tests passed! API is working correctly.', 'green');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`, 'red');
  }

  console.log('');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
