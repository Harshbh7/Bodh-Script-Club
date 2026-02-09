// Dedicated serverless function for payment history
// Optimized for Vercel deployment
import connectDB from '../lib/db.js';
import Payment from '../models/PaymentModel.js';
import Event from '../models/EventModel.js';
import User from '../models/UserModel.js';
import EventRegistration from '../models/EventRegistrationModel.js';
import jwt from 'jsonwebtoken';

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Verify JWT token
function verifyToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }
    
    const token = authHeader.substring(7);
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  setCORSHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  console.log('🔵 [PAYMENT-HISTORY] Request received');

  try {
    // Connect to database
    console.log('🔵 [PAYMENT-HISTORY] Connecting to database...');
    await connectDB();
    console.log('✅ [PAYMENT-HISTORY] Database connected');

    // Verify authentication
    console.log('🔵 [PAYMENT-HISTORY] Verifying token...');
    const decoded = verifyToken(req);
    console.log('✅ [PAYMENT-HISTORY] Token verified:', decoded.userId);

    // Check admin access
    if (decoded.role !== 'admin' && !decoded.isAdmin) {
      console.log('❌ [PAYMENT-HISTORY] Access denied - not admin');
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Fetch payments WITHOUT populate (to avoid Vercel issues)
    console.log('🔵 [PAYMENT-HISTORY] Fetching payments...');
    
    const payments = await Payment.find()
      .select('orderId paymentId amount currency status userName userEmail registrationNo phoneNumber createdAt paidAt event user registration')
      .lean()
      .sort({ createdAt: -1 })
      .limit(200);

    console.log(`✅ [PAYMENT-HISTORY] Found ${payments.length} payments`);

    // Get unique IDs for batch fetching
    const eventIds = [...new Set(payments.map(p => p.event).filter(Boolean))];
    const userIds = [...new Set(payments.map(p => p.user).filter(Boolean))];
    const registrationIds = [...new Set(payments.map(p => p.registration).filter(Boolean))];

    console.log('🔵 [PAYMENT-HISTORY] Fetching related data...');
    console.log(`   Events: ${eventIds.length}, Users: ${userIds.length}, Registrations: ${registrationIds.length}`);

    // Fetch related data in parallel with error handling
    const [events, users, registrations] = await Promise.all([
      eventIds.length > 0 
        ? Event.find({ _id: { $in: eventIds } }).select('title date location price').lean().catch(err => {
            console.error('Error fetching events:', err);
            return [];
          })
        : Promise.resolve([]),
      userIds.length > 0
        ? User.find({ _id: { $in: userIds } }).select('name email').lean().catch(err => {
            console.error('Error fetching users:', err);
            return [];
          })
        : Promise.resolve([]),
      registrationIds.length > 0
        ? EventRegistration.find({ _id: { $in: registrationIds } }).select('registrationNo phoneNumber name').lean().catch(err => {
            console.error('Error fetching registrations:', err);
            return [];
          })
        : Promise.resolve([])
    ]);

    console.log('✅ [PAYMENT-HISTORY] Related data fetched');

    // Create lookup maps for fast access
    const eventMap = new Map(events.map(e => [e._id.toString(), e]));
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const registrationMap = new Map(registrations.map(r => [r._id.toString(), r]));

    // Transform payments with related data
    const transformedPayments = payments.map(payment => {
      const event = payment.event ? eventMap.get(payment.event.toString()) : null;
      const user = payment.user ? userMap.get(payment.user.toString()) : null;
      const registration = payment.registration ? registrationMap.get(payment.registration.toString()) : null;

      return {
        _id: payment._id,
        orderId: payment.orderId || 'N/A',
        paymentId: payment.paymentId || 'Pending',
        amount: payment.amount || 0,
        currency: payment.currency || 'INR',
        status: payment.status || 'pending',
        userName: payment.userName || user?.name || registration?.name || 'N/A',
        userEmail: payment.userEmail || user?.email || 'N/A',
        registrationNo: payment.registrationNo || registration?.registrationNo || 'N/A',
        phoneNumber: payment.phoneNumber || registration?.phoneNumber || 'N/A',
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        event: event ? {
          _id: event._id,
          title: event.title || 'Event',
          date: event.date,
          location: event.location || 'TBA',
          price: event.price || 0
        } : { title: 'Unknown Event' },
        user: user || null,
        registration: registration || null
      };
    });

    console.log('✅ [PAYMENT-HISTORY] Sending response with', transformedPayments.length, 'payments');

    // Send response
    return res.status(200).json({
      success: true,
      count: transformedPayments.length,
      payments: transformedPayments,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [PAYMENT-HISTORY] Error:', error);
    console.error('❌ [PAYMENT-HISTORY] Error name:', error.name);
    console.error('❌ [PAYMENT-HISTORY] Error message:', error.message);
    console.error('❌ [PAYMENT-HISTORY] Error stack:', error.stack);

    // Handle specific errors
    if (error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: error.message
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    });
  }
}
