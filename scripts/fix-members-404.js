#!/usr/bin/env node

// Automated fix script for members 404 issue
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const API_BASE = 'http://localhost:5173/api';

console.log('🔧 Automated Members 404 Fix Script');
console.log('=====================================\n');

async function fixMembers404() {
  let issuesFound = [];
  let fixesApplied = [];

  try {
    // Check 1: Is the dev server running?
    console.log('Check 1: Testing if dev server is running...');
    try {
      const healthResponse = await fetch(`${API_BASE}/health`, { timeout: 3000 });
      if (healthResponse.ok) {
        console.log('✅ Dev server is running\n');
      } else {
        issuesFound.push('Dev server returned error status');
      }
    } catch (error) {
      console.log('❌ Dev server is NOT running');
      issuesFound.push('Dev server not running');
      console.log('\n💡 Fix: Run "npm run dev" in another terminal\n');
      console.log('Cannot proceed without dev server. Exiting...');
      return;
    }

    // Check 2: Does admin user exist?
    console.log('Check 2: Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      })
    });

    let token;
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      issuesFound.push('Admin user missing or password incorrect');
      
      console.log('\n🔧 Attempting to create admin user...');
      try {
        const createAdminResponse = await fetch(`${API_BASE}/create-admin`, {
          method: 'POST'
        });
        
        if (createAdminResponse.ok) {
          console.log('✅ Admin user created');
          fixesApplied.push('Created admin user');
          
          // Try login again
          const retryLogin = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'admin@bodhscriptclub.com',
              password: 'Admin@123!'
            })
          });
          
          if (retryLogin.ok) {
            const loginData = await retryLogin.json();
            token = loginData.accessToken;
            console.log('✅ Admin login successful\n');
          }
        } else {
          console.log('❌ Failed to create admin user');
          console.log('   Run manually: node scripts/createAdmin.js\n');
          return;
        }
      } catch (error) {
        console.log('❌ Error creating admin:', error.message);
        return;
      }
    } else {
      const loginData = await loginResponse.json();
      token = loginData.accessToken;
      console.log('✅ Admin login successful\n');
    }

    // Check 3: Test GET /members
    console.log('Check 3: Testing GET /members...');
    const getMembersResponse = await fetch(`${API_BASE}/members`);
    if (getMembersResponse.ok) {
      const members = await getMembersResponse.json();
      console.log(`✅ GET /members works - Found ${members.length} members\n`);
    } else {
      console.log('❌ GET /members failed');
      issuesFound.push('GET /members endpoint not working');
      const errorText = await getMembersResponse.text();
      console.log('   Error:', errorText, '\n');
    }

    // Check 4: Test POST /members
    console.log('Check 4: Testing POST /members...');
    const testMember = {
      name: 'Test Member (Auto-created)',
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

    let testMemberId;
    if (createResponse.ok) {
      const created = await createResponse.json();
      testMemberId = created.member?._id;
      console.log('✅ POST /members works');
      console.log(`   Created test member with ID: ${testMemberId}\n`);
    } else {
      console.log('❌ POST /members failed');
      issuesFound.push('POST /members endpoint not working');
      const errorText = await createResponse.text();
      console.log('   Error:', errorText, '\n');
    }

    // Check 5: Test PUT /members/:id
    if (testMemberId) {
      console.log('Check 5: Testing PUT /members/:id...');
      const updateResponse = await fetch(`${API_BASE}/members/${testMemberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...testMember,
          name: 'Test Member (Updated)'
        })
      });

      if (updateResponse.ok) {
        console.log('✅ PUT /members/:id works\n');
      } else {
        console.log('❌ PUT /members/:id failed');
        issuesFound.push('PUT /members/:id endpoint not working');
        const errorText = await updateResponse.text();
        console.log('   Error:', errorText, '\n');
      }

      // Check 6: Test DELETE /members/:id
      console.log('Check 6: Testing DELETE /members/:id...');
      const deleteResponse = await fetch(`${API_BASE}/members/${testMemberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ DELETE /members/:id works');
        console.log('   Test member cleaned up\n');
      } else {
        console.log('❌ DELETE /members/:id failed');
        issuesFound.push('DELETE /members/:id endpoint not working');
        const errorText = await deleteResponse.text();
        console.log('   Error:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message === 'API endpoint not found') {
            console.log('\n🔴 CRITICAL: DELETE route is not being matched!');
            console.log('   This is the source of your 404 error.');
            console.log('   The API handler\'s route matching is broken.\n');
            issuesFound.push('API route matching broken');
          }
        } catch (e) {
          // Not JSON
        }
        console.log('');
      }
    }

    // Summary
    console.log('=====================================');
    console.log('📊 SUMMARY\n');
    
    if (issuesFound.length === 0) {
      console.log('🎉 All checks passed! No issues found.');
      console.log('\nIf you\'re still seeing 404 in the browser:');
      console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
      console.log('2. Hard refresh (Ctrl+Shift+R)');
      console.log('3. Re-login to admin panel');
      console.log('4. Check browser DevTools → Network tab');
      console.log('5. Verify the member ID is valid');
    } else {
      console.log('❌ Issues Found:');
      issuesFound.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (fixesApplied.length > 0) {
      console.log('\n✅ Fixes Applied:');
      fixesApplied.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
      });
    }

    console.log('\n=====================================');
    
    if (issuesFound.includes('API route matching broken')) {
      console.log('\n🔧 RECOMMENDED ACTION:');
      console.log('The DELETE route is not being matched by the API handler.');
      console.log('This is likely due to a corrupted api/index.js file.');
      console.log('\nTo fix:');
      console.log('1. Check api/index.js around line 795');
      console.log('2. Verify the regex pattern matching code is correct');
      console.log('3. Restart the dev server');
      console.log('\nOr restore api/index.js from git if available.');
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the fix
fixMembers404();