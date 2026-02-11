// Test endpoint to diagnose registration issues
import connectDB from '../lib/db.js';
import mongoose from 'mongoose';
import Event from '../models/EventModel.js';
import EventRegistration from '../models/EventRegistrationModel.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 [TEST] Starting registration test...');
    
    // Test 1: Database connection
    await connectDB();
    console.log('✅ [TEST] Database connected');
    
    // Test 2: Check if models are loaded
    console.log('✅ [TEST] Event model:', Event.modelName);
    console.log('✅ [TEST] EventRegistration model:', EventRegistration.modelName);
    
    // Test 3: Check if we can query events
    const eventCount = await Event.countDocuments();
    console.log(`✅ [TEST] Found ${eventCount} events in database`);
    
    // Test 4: Check if we can query registrations
    const regCount = await EventRegistration.countDocuments();
    console.log(`✅ [TEST] Found ${regCount} registrations in database`);
    
    // Test 5: Get first event
    const firstEvent = await Event.findOne();
    console.log('✅ [TEST] First event:', firstEvent ? firstEvent.title : 'No events found');
    
    res.status(200).json({
      success: true,
      message: 'All tests passed',
      tests: {
        databaseConnected: true,
        modelsLoaded: true,
        eventCount,
        registrationCount: regCount,
        firstEvent: firstEvent ? {
          id: firstEvent._id,
          title: firstEvent.title,
          slug: firstEvent.slug
        } : null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) + '...'
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
