// Quick API test
import fetch from 'node-fetch';

const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function test() {
  console.log('\n🧪 Testing API at:', BASE, '\n');
  
  // Test 1: Health
  try {
    const r = await fetch(`${BASE}/health`);
    const d = await r.json();
    console.log('✅ Health:', d.status, '| MongoDB:', d.mongodb);
  } catch (e) {
    console.log('❌ Health failed:', e.message);
  }
  
  // Test 2: Events
  try {
    const r = await fetch(`${BASE}/events`);
    const d = await r.json();
    console.log(`✅ Events: ${d.length} found`);
  } catch (e) {
    console.log('❌ Events failed:', e.message);
  }
  
  // Test 3: Members
  try {
    const r = await fetch(`${BASE}/members`);
    const d = await r.json();
    console.log(`✅ Members: ${d.length} found`);
  } catch (e) {
    console.log('❌ Members failed:', e.message);
  }
  
  // Test 4: Testimonials
  try {
    const r = await fetch(`${BASE}/testimonials`);
    const d = await r.json();
    console.log(`✅ Testimonials: ${d.length} found`);
  } catch (e) {
    console.log('❌ Testimonials failed:', e.message);
  }
  
  // Test 5: Login
  try {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@bodhscript.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      })
    });
    const d = await r.json();
    if (d.token) {
      console.log('✅ Login: Success | User:', d.user.name);
    } else {
      console.log('❌ Login failed:', d.message);
    }
  } catch (e) {
    console.log('❌ Login error:', e.message);
  }
  
  console.log('\n✨ Test complete\n');
}

test();
