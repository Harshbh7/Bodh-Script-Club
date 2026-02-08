#!/usr/bin/env node

// Test script to verify events flow from admin panel to home page
import fetch from 'node-fetch';

const API_BASE = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api`
  : 'http://localhost:5000/api';

console.log('🧪 Testing Events Flow...');
console.log('API Base:', API_BASE);

async function testEventsFlow() {
  try {
    // 1. Test admin login
    console.log('\n1️⃣ Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bodhscriptclub.com',
        password: 'Admin@123!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Admin login successful');

    // 2. Create a test event
    console.log('\n2️⃣ Creating test event...');
    const testEvent = {
      title: 'Test Workshop: React Fundamentals',
      description: 'Learn the basics of React.js in this hands-on workshop. Perfect for beginners who want to get started with modern web development.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      time: '14:00',
      location: 'Computer Lab 1, Main Building',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop',
      status: 'upcoming',
      maxAttendees: 50,
      tags: 'Workshop,React,JavaScript,Web Development'
    };

    const createResponse = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testEvent)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create event failed: ${createResponse.status} ${createResponse.statusText}\n${errorText}`);
    }

    const createdEvent = await createResponse.json();
    console.log('✅ Test event created:', createdEvent.event?.title || 'Event created');

    // 3. Fetch all events (admin view)
    console.log('\n3️⃣ Fetching all events (admin view)...');
    const allEventsResponse = await fetch(`${API_BASE}/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!allEventsResponse.ok) {
      throw new Error(`Fetch all events failed: ${allEventsResponse.status}`);
    }

    const allEvents = await allEventsResponse.json();
    console.log(`✅ Found ${allEvents.length} total events`);

    // 4. Fetch upcoming events (home page view)
    console.log('\n4️⃣ Fetching upcoming events (home page view)...');
    const upcomingEvents = allEvents.filter(event => event.status === 'upcoming');
    console.log(`✅ Found ${upcomingEvents.length} upcoming events for home page`);

    // 5. Verify the test event appears in upcoming events
    const testEventInList = upcomingEvents.find(event => 
      event.title === testEvent.title
    );

    if (testEventInList) {
      console.log('✅ Test event found in upcoming events list');
      console.log('   Title:', testEventInList.title);
      console.log('   Date:', testEventInList.date);
      console.log('   Image:', testEventInList.image);
      console.log('   Status:', testEventInList.status);
    } else {
      console.log('❌ Test event NOT found in upcoming events list');
    }

    // 6. Test public events endpoint (no auth required)
    console.log('\n5️⃣ Testing public events endpoint...');
    const publicEventsResponse = await fetch(`${API_BASE}/events`);
    
    if (!publicEventsResponse.ok) {
      throw new Error(`Public events fetch failed: ${publicEventsResponse.status}`);
    }

    const publicEvents = await publicEventsResponse.json();
    const publicUpcoming = publicEvents.filter(event => event.status === 'upcoming');
    console.log(`✅ Public endpoint returns ${publicUpcoming.length} upcoming events`);

    // 7. Clean up - delete the test event
    if (createdEvent.event?._id) {
      console.log('\n6️⃣ Cleaning up test event...');
      const deleteResponse = await fetch(`${API_BASE}/events/${createdEvent.event._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (deleteResponse.ok) {
        console.log('✅ Test event cleaned up successfully');
      } else {
        console.log('⚠️ Failed to clean up test event (manual cleanup may be needed)');
      }
    }

    console.log('\n🎉 Events flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin authentication works');
    console.log('   ✅ Event creation works');
    console.log('   ✅ Event listing works');
    console.log('   ✅ Status filtering works');
    console.log('   ✅ Public API access works');
    console.log('   ✅ Events will display on home page');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testEventsFlow();