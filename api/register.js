// Dedicated registration endpoint for better reliability
import connectDB from '../lib/db.js';
import mongoose from 'mongoose';
import Event from '../models/EventModel.js';
import EventRegistration from '../models/EventRegistrationModel.js';

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🎯 [REGISTRATION] Starting event registration...');
  
  try {
    await connectDB();
    console.log('✅ [REGISTRATION] Database connected');
    
    // Get event ID from query parameter
    const { eventId } = req.query;
    const registrationData = req.body;

    console.log(`📝 [REGISTRATION] Event ID: ${eventId}`);
    console.log(`📝 [REGISTRATION] Registration Data:`, {
      name: registrationData.name,
      registrationNo: registrationData.registrationNo,
      phoneNumber: registrationData.phoneNumber,
      course: registrationData.course
    });

    // Validate required fields
    const requiredFields = ['name', 'registrationNo', 'phoneNumber', 'course', 'section', 'year', 'department'];
    const missingFields = requiredFields.filter(field => !registrationData[field]);
    
    if (missingFields.length > 0) {
      console.log(`❌ [REGISTRATION] Missing fields: ${missingFields.join(', ')}`);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Check if event exists - support both slug and ObjectId
    let event;
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
    console.log(`🔍 [REGISTRATION] Is valid ObjectId: ${isObjectId}`);
    
    if (isObjectId) {
      console.log('🔍 [REGISTRATION] Trying to find event by ObjectId...');
      event = await Event.findById(eventId);
    }
    
    if (!event) {
      console.log('🔍 [REGISTRATION] Trying to find event by slug...');
      event = await Event.findOne({ slug: eventId });
    }
    
    if (!event) {
      console.log(`❌ [REGISTRATION] Event not found with ID/slug: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log(`✅ [REGISTRATION] Event found: ${event.title} (ID: ${event._id})`);

    // Check if event is paid (should go through payment flow)
    if (event.isPaid && event.price > 0) {
      console.log(`💰 [REGISTRATION] Event is paid (₹${event.price}), redirecting to payment`);
      return res.status(400).json({ 
        message: 'This is a paid event. Please complete payment first.',
        requiresPayment: true,
        price: event.price
      });
    }

    // Check if already registered with this registration number for this event
    console.log(`🔍 [REGISTRATION] Checking for duplicate registration...`);
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      registrationNo: registrationData.registrationNo.trim().toUpperCase()
    });

    if (existingRegistration) {
      console.log(`❌ [REGISTRATION] Duplicate registration found`);
      return res.status(400).json({ 
        message: 'This registration number is already registered for this event',
        error: 'DUPLICATE_REGISTRATION'
      });
    }

    // For hackathons, validate team requirements
    if (event.eventType === 'hackathon' && event.teamSettings?.enabled) {
      console.log(`👥 [REGISTRATION] Validating hackathon team requirements...`);
      
      if (!registrationData.teamName) {
        return res.status(400).json({ message: 'Team name is required for hackathon registration' });
      }

      const teamSize = (registrationData.teamMembers?.length || 0) + 1; // +1 for leader
      const minSize = event.teamSettings.minTeamSize || 1;
      const maxSize = event.teamSettings.maxTeamSize || 4;

      console.log(`👥 [REGISTRATION] Team size: ${teamSize}, Min: ${minSize}, Max: ${maxSize}`);

      if (teamSize < minSize || teamSize > maxSize) {
        return res.status(400).json({ 
          message: `Team must have between ${minSize} and ${maxSize} members (including team leader)` 
        });
      }

      // Validate team member data
      if (registrationData.teamMembers && registrationData.teamMembers.length > 0) {
        for (const member of registrationData.teamMembers) {
          if (!member.name || !member.registrationNo || !member.phoneNumber || !member.course) {
            return res.status(400).json({ 
              message: 'All team members must have name, registration number, phone, and course' 
            });
          }
        }
      }
    }

    // Create registration for free event (no user authentication required)
    console.log(`💾 [REGISTRATION] Creating registration record...`);
    const registration = new EventRegistration({
      event: event._id,
      user: null, // No user required for public registration
      name: registrationData.name.trim(),
      registrationNo: registrationData.registrationNo.trim().toUpperCase(),
      phoneNumber: registrationData.phoneNumber.trim(),
      whatsappNumber: registrationData.whatsappNumber?.trim() || registrationData.phoneNumber.trim(),
      section: registrationData.section.trim(),
      department: registrationData.department.trim(),
      year: registrationData.year.trim(),
      course: registrationData.course.trim(),
      // Team registration fields
      isTeamRegistration: registrationData.isTeamRegistration || false,
      teamName: registrationData.teamName?.trim() || null,
      teamMembers: registrationData.teamMembers || [],
      paymentStatus: 'free',
      registeredAt: new Date()
    });

    await registration.save();
    console.log(`✅ [REGISTRATION] Registration saved with ID: ${registration._id}`);

    // Update event registration count
    console.log(`📊 [REGISTRATION] Updating event registration count...`);
    await Event.findByIdAndUpdate(event._id, {
      $inc: { registrationCount: 1 }
    });
    console.log(`✅ [REGISTRATION] Event registration count updated`);

    console.log(`🎉 [REGISTRATION] Registration completed successfully!`);
    res.status(201).json({
      success: true,
      message: 'Registration successful! You will receive confirmation shortly.',
      registration: {
        id: registration._id,
        name: registration.name,
        registrationNo: registration.registrationNo,
        event: {
          id: event._id,
          title: event.title,
          date: event.date
        }
      }
    });
  } catch (error) {
    console.error('❌ [REGISTRATION] Error:', error.name);
    console.error('❌ [REGISTRATION] Message:', error.message);
    console.error('❌ [REGISTRATION] Stack:', error.stack);
    
    // Send detailed error response
    res.status(500).json({
      success: false,
      message: 'Failed to register for event. Please try again.',
      error: error.message,
      errorType: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
