import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function testPaymentHistoryEndpoint() {
  console.log('🧪 Testing New Payment History Endpoint\n');

  try {
    // Login
    console.log('1️⃣ Logging in...');
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

    // Test new endpoint
    console.log('2️⃣ Testing NEW endpoint: GET /payment-history');
    const response = await fetch(`${API_URL}/payment-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('   Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NEW endpoint works!');
      console.log('   Success:', data.success);
      console.log('   Count:', data.count);
      console.log('   Payments:', data.payments?.length);
      console.log('   Timestamp:', data.timestamp);
      
      if (data.payments && data.payments.length > 0) {
        console.log('\n   Sample payment:');
        const sample = data.payments[0];
        console.log('   - Order ID:', sample.orderId);
        console.log('   - Amount:', sample.amount);
        console.log('   - Status:', sample.status);
        console.log('   - User:', sample.userName);
        console.log('   - Event:', sample.event?.title);
      }
      
      console.log('\n✅ Payment history endpoint working perfectly!');
      console.log('✅ Ready for Vercel deployment!');
    } else {
      console.log('❌ Endpoint failed');
      const error = await response.json();
      console.log('   Error:', JSON.stringify(error, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPaymentHistoryEndpoint();
