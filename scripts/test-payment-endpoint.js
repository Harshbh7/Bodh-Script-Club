import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function testPaymentEndpoint() {
  console.log('🧪 Testing Payment Endpoint...\n');

  try {
    // Step 1: Login as user to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
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
    console.log('✅ Login successful\n');

    // Step 2: Get events to find a paid event
    console.log('2️⃣ Fetching events...');
    const eventsResponse = await fetch(`${API_URL}/events`);
    const events = await eventsResponse.json();
    
    const paidEvent = events.find(e => e.isPaid && e.price > 0);
    
    if (!paidEvent) {
      console.log('⚠️  No paid events found. Creating a test paid event...');
      
      const createEventResponse = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Paid Event',
          description: 'Test event for payment',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Test Location',
          image: 'https://via.placeholder.com/400',
          isPaid: true,
          price: 30
        })
      });
      
      const newEvent = await createEventResponse.json();
      console.log('✅ Test event created:', newEvent.event.title);
      console.log('   Event ID:', newEvent.event._id);
      console.log('   Price: ₹' + newEvent.event.price + '\n');
      
      // Step 3: Test payment endpoint
      console.log('3️⃣ Testing payment/create-order endpoint...');
      const paymentResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: newEvent.event._id,
          amount: newEvent.event.price,
          registrationData: {
            name: 'Test User',
            registrationNo: 'TEST123',
            phoneNumber: '9999999999'
          }
        })
      });

      console.log('Response Status:', paymentResponse.status);
      const paymentData = await paymentResponse.json();
      console.log('Response Data:', JSON.stringify(paymentData, null, 2));

      if (paymentResponse.ok) {
        console.log('\n✅ Payment endpoint is working!');
        console.log('   Order ID:', paymentData.order.id);
        console.log('   Amount:', paymentData.order.amount / 100, 'INR');
      } else {
        console.log('\n❌ Payment endpoint failed!');
        console.log('   Error:', paymentData.message || paymentData.error);
      }
    } else {
      console.log('✅ Found paid event:', paidEvent.title);
      console.log('   Event ID:', paidEvent._id);
      console.log('   Price: ₹' + paidEvent.price + '\n');
      
      // Step 3: Test payment endpoint
      console.log('3️⃣ Testing payment/create-order endpoint...');
      const paymentResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: paidEvent._id,
          amount: paidEvent.price,
          registrationData: {
            name: 'Test User',
            registrationNo: 'TEST123',
            phoneNumber: '9999999999'
          }
        })
      });

      console.log('Response Status:', paymentResponse.status);
      const paymentData = await paymentResponse.json();
      console.log('Response Data:', JSON.stringify(paymentData, null, 2));

      if (paymentResponse.ok) {
        console.log('\n✅ Payment endpoint is working!');
        console.log('   Order ID:', paymentData.order.id);
        console.log('   Amount:', paymentData.order.amount / 100, 'INR');
      } else {
        console.log('\n❌ Payment endpoint failed!');
        console.log('   Error:', paymentData.message || paymentData.error);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPaymentEndpoint();
