#!/usr/bin/env node

// Test script to verify members API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5173/api';

console.log('🧪 Testing Members API...');
console.log('API Base:', API_BASE);

async function testMembersAPI() {
  try {
    // 1. Test GET /members (public endpoint)
    console.log('\n1️⃣ Testing GET /members...');
    const getResponse = await fetch(`${API_BASE}/members`);
    console.log('Status:', getResponse.status, getResponse.statusText);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('Error response:', errorText);
      throw new Error(`GET /members failed: ${getResponse.status}`);
    }
    
    const members = await getResponse.json();
    console.log(`✅ Found ${members.length} members`);
    
    // 2. Test admin login
    console.log('\n2️⃣ Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Admin login successful');

    // 3. Test POST /members (create)
    console.log('\n3️⃣ Testing POST /members (create)...');
    const testMember = {
      name: 'Test Member',
      role: 'developer',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      github: 'https://github.com/testuser',
      linkedin: 'https://linkedin.com/in/testuser',
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

    console.log('Create Status:', createResponse.status, createResponse.statusText);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log('Error response:', errorText);
      throw new Error(`POST /members failed: ${createResponse.status}`);
    }

    const createdMember = await createResponse.json();
    const memberId = createdMember.member?._id;
    console.log('✅ Member created with ID:', memberId);

    // 4. Test PUT /members/:id (update)
    if (memberId) {
      console.log('\n4️⃣ Testing PUT /members/:id (update)...');
      const updateData = {
        ...testMember,
        name: 'Test Member Updated',
        role: 'technical-lead'
      };

      const updateResponse = await fetch(`${API_BASE}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('Update Status:', updateResponse.status, updateResponse.statusText);
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.log('Error response:', errorText);
      } else {
        console.log('✅ Member updated successfully');
      }

      // 5. Test DELETE /members/:id
      console.log('\n5️⃣ Testing DELETE /members/:id...');
      const deleteResponse = await fetch(`${API_BASE}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete Status:', deleteResponse.status, deleteResponse.statusText);
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.log('Error response:', errorText);
        console.log('❌ Delete failed');
      } else {
        console.log('✅ Member deleted successfully');
      }
    }

    console.log('\n🎉 Members API test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testMembersAPI();