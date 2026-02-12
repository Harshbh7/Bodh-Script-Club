// Quick API Verification Script
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function quickVerify() {
  console.log('\n🔍 Quick API Verification\n');
  console.log(`Testing: ${API_URL}\n`);

  // Test 1: Health
  try {
    const health = await fetch(`${API_URL}/health`);
    const healthData = await health.json();
    console.log('✅ Health:', healthData.status, '| MongoDB:', healthData.mongodb);
  } catch (e) {
    console.log('❌ Health check failed:', e.message);
  }

  // Test 2: Events
  try {
    const events = await fetch(`${API_URL}/events`);
    const eventsData = await events.json();
    console.log(`✅ Events: ${eventsData.length} events found`);
  } catch (e) {
    console.log('❌ Events fetch failed:', e.message);
  }

  // Test 3: Members
  try {
    const members = await fetch(`${API_URL}/members`);
    const membersData = await members.json();
    console.log(`✅ Members: ${membersData.length} members found`);
  } catch (e) {
    console.log('❌ Members fetch failed:', e.message);
  }

  // Test 4: Testimonials
  try {
    const testimonials = await fetch(`${API_URL}/testimonials`);
    const testimonialsData = await testimonials.json();
    console.log(`✅ Testimonials: ${testimonialsData.length} testimonials found`);
  } catch (e) {
    console.log('❌ Testimonials fetch failed:', e.message);
  }

  // Test 5: Gallery
  try {
    const gallery = await fetch(`${API_URL}/gallery`);
    const galleryData = await gallery.json();
    console.log(`✅ Gallery: ${galleryData.length} items found`);
  } catch (e) {
    console.log('❌ Gallery fetch failed:', e.message);
  }

  console.log('\n✨ Verification complete!\n');
}

quickVerify();
