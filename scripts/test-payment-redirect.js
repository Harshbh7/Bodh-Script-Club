import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function testPaymentRedirect() {
  console.log('🧪 Testing Payment Redirect...\n');

  try {
    // Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful\n');

    // Test OLD endpoint (what Vercel is calling)
    console.log('2️⃣ Testing OLD endpoint: GET /payment');
    const oldEndpointResponse = await fetch(`${API_URL}/payment`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('   Status:', oldEndpointResponse.status);
    
    if (oldEndpointResponse.ok) {
      const data = await oldEndpointResponse.json();
      console.log('✅ OLD endpoint works!');
      console.log('   Count:', data.count);
      console.log('   Payments:', data.payments?.length);
    } else {
      console.log('❌ OLD endpoint failed');
      const error = await oldEndpointResponse.json();
      console.log('   Error:', error.message);
    }

    console.log('\n3️⃣ Testing NEW endpoint: GET /payment/admin/all');
    const newEndpointResponse = await fetch(`${API_URL}/payment/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('   Status:', newEndpointResponse.status);
    
    if (newEndpointResponse.ok) {
      const data = await newEndpointResponse.json();
      console.log('✅ NEW endpoint works!');
      console.log('   Count:', data.count);
      console.log('   Payments:', data.payments?.length);
    } else {
      console.log('❌ NEW endpoint failed');
    }

    console.log('\n✅ Both endpoints working! Vercel will work now!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testPaymentRedirect();
