import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testEventsHomepage() {
  console.log('Testing Events on Homepage...\n');

  try {
    // 1. Fetch all events
    console.log('1. Fetching all events...');
    const { data: events } = await axios.get(`${API_URL}/events`);
    console.log(`   ✓ Total events: ${events.length}`);
    
    if (events.length === 0) {
      console.log('   ⚠ No events found in database!');
      console.log('   → Create events in Admin Panel first');
      return;
    }

    // 2. Show event statuses
    console.log('\n2. Event Status Breakdown:');
    const statusCounts = {
      upcoming: events.filter(e => e.status === 'upcoming').length,
      completed: events.filter(e => e.status === 'completed').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
    };
    console.log(`   - Upcoming: ${statusCounts.upcoming}`);
    console.log(`   - Completed: ${statusCounts.completed}`);
    console.log(`   - Cancelled: ${statusCounts.cancelled}`);

    // 3. Show upcoming events (what homepage displays)
    console.log('\n3. Upcoming Events (Homepage will show):');
    const upcomingEvents = events.filter(e => e.status === 'upcoming').slice(0, 4);
    
    if (upcomingEvents.length === 0) {
      console.log('   ⚠ No upcoming events found!');
      console.log('   → Change event status to "upcoming" in Admin Panel');
    } else {
      upcomingEvents.forEach((event, idx) => {
        console.log(`   ${idx + 1}. ${event.title}`);
        console.log(`      - Status: ${event.status}`);
        console.log(`      - Date: ${new Date(event.date).toLocaleDateString()}`);
        console.log(`      - Image: ${event.image ? '✓' : '✗'}`);
      });
    }

    // 4. Check for common issues
    console.log('\n4. Checking for Issues:');
    const eventsWithoutStatus = events.filter(e => !e.status);
    if (eventsWithoutStatus.length > 0) {
      console.log(`   ⚠ ${eventsWithoutStatus.length} events have no status`);
    } else {
      console.log('   ✓ All events have status');
    }

    const eventsWithInvalidStatus = events.filter(e => 
      e.status && !['upcoming', 'completed', 'cancelled'].includes(e.status)
    );
    if (eventsWithInvalidStatus.length > 0) {
      console.log(`   ⚠ ${eventsWithInvalidStatus.length} events have invalid status:`);
      eventsWithInvalidStatus.forEach(e => {
        console.log(`      - "${e.title}" has status: "${e.status}"`);
      });
    } else {
      console.log('   ✓ All events have valid status');
    }

    console.log('\n✅ Test Complete!');
    
    if (upcomingEvents.length > 0) {
      console.log('\n📌 Homepage should display these events correctly.');
    } else {
      console.log('\n📌 To see events on homepage:');
      console.log('   1. Go to Admin Panel → Events');
      console.log('   2. Create new events OR edit existing events');
      console.log('   3. Set status to "upcoming"');
      console.log('   4. Refresh homepage');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testEventsHomepage();
