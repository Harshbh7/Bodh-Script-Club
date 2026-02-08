#!/usr/bin/env node

// Debug script to identify the 404 issue with members API
import fetch from 'node-fetch';

const API_BASE = process.env.API_URL || 'http://localhost:5173/api';

console.log('🔍 Debugging Members 404 Issue...');
console.log('API Base:', API_BASE);
console.log('');

async function debugMembers404() {
  try {
    // Step 1: Check if API is reachable
    console.log('Step 1: Testing API health...');
    try {
      const healthResponse = await fetch(`${API_BASE}/health`);
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        console.log('✅ API is reachable');
        console.log('   Status:', health.status);
        console.log('   Environment:', health.environment);
      } else {
        console.log('❌ API health check failed:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ Cannot reach API:', error.message);
      console.log('   Make sure the development server is running: npm run dev');
      return;
    }

    // Step 2: Test GET /members (should work without auth)
    console.log('\nStep 2: Testing GET /members...');
    const getMembersResponse = await fetch(`${API_BASE}/members`);
    console.log('   Status:', getMembersResponse.status, getMembersResponse.statusText);
    
    if (getMembersResponse.ok) {
      const members = await getMembersResponse.json();
      console.log(`   ✅ GET /members works - Found ${members.length} members`);
    } else {
      const errorText = await getMembersResponse.text();
      console.log('   ❌ GET /members failed');
      console.log('   Response:', errorText);
    }

    // Step 3: Login as admin
    console.log('\nStep 3: Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Admin login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('   Response:', errorText);
      console.log('\n   💡 Tip: Run "node scripts/createAdmin.js" to create admin user');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('   ✅ Admin login successful');
    console.log('   Token:', token.substring(0, 20) + '...');

    // Step 4: Test DELETE with a fake ID to see the error
    console.log('\nStep 4: Testing DELETE /members/:id with fake ID...');
    const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
    const deleteResponse = await fetch(`${API_BASE}/members/${fakeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('   Status:', deleteResponse.status, deleteResponse.statusText);
    const deleteText = await deleteResponse.text();
    console.log('   Response:', deleteText);

    if (deleteResponse.status === 404) {
      try {
        const deleteJson = JSON.parse(deleteText);
        if (deleteJson.message === 'Member not found') {
          console.log('   ✅ DELETE endpoint works correctly (member not found is expected)');
        } else if (deleteJson.message === 'API endpoint not found') {
          console.log('   ❌ DELETE endpoint not found in API routes!');
          console.log('   This means the route pattern matching is broken');
        }
      } catch (e) {
        console.log('   ⚠️ Could not parse response as JSON');
      }
    }

    // Step 5: Create a test member
    console.log('\nStep 5: Creating a test member...');
    const testMember = {
      name: 'Debug Test Member',
      role: 'developer',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      order: 999
    };

    const createResponse = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testMember)
    });

    console.log('   Status:', createResponse.status, createResponse.statusText);
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      const memberId = created.member?._id;
      console.log('   ✅ POST /members works');
      console.log('   Created member ID:', memberId);

      if (memberId) {
        // Step 6: Try to delete the test member
        console.log('\nStep 6: Deleting the test member...');
        const deleteTestResponse = await fetch(`${API_BASE}/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('   Status:', deleteTestResponse.status, deleteTestResponse.statusText);
        
        if (deleteTestResponse.ok) {
          console.log('   ✅ DELETE /members/:id works!');
          console.log('\n🎉 All member API endpoints are working correctly!');
          console.log('\n💡 If you\'re still seeing 404 in the browser:');
          console.log('   1. Check browser console for the exact URL being called');
          console.log('   2. Verify the member ID is valid');
          console.log('   3. Make sure you\'re logged in (token not expired)');
          console.log('   4. Try hard refresh (Ctrl+Shift+R) to clear cache');
        } else {
          const deleteErrorText = await deleteTestResponse.text();
          console.log('   ❌ DELETE failed');
          console.log('   Response:', deleteErrorText);
          
          try {
            const deleteError = JSON.parse(deleteErrorText);
            if (deleteError.message === 'API endpoint not found') {
              console.log('\n🔴 FOUND THE ISSUE: DELETE route is not being matched!');
              console.log('   The API handler\'s regex pattern matching is broken.');
              console.log('   Check api/index.js line ~795 for the regex pattern code.');
            }
          } catch (e) {
            // Not JSON
          }
        }
      }
    } else {
      const createErrorText = await createResponse.text();
      console.log('   ❌ POST /members failed');
      console.log('   Response:', createErrorText);
    }

    console.log('\n📊 Summary:');
    console.log('   - API Health: ✅');
    console.log('   - GET /members: ✅');
    console.log('   - Admin Login: ✅');
    console.log('   - POST /members: ' + (createResponse.ok ? '✅' : '❌'));
    console.log('   - DELETE /members/:id: Check results above');

  } catch (error) {
    console.error('\n❌ Debug script failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the debug
debugMembers404();