// Main API Handler - Vercel Serverless Function
import connectDB from '../lib/db.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Import models
import User from '../models/UserModel.js';
import Event from '../models/EventModel.js';
import EventRegistration from '../models/EventRegistrationModel.js';
import Gallery from '../models/GalleryModel.js';
import Member from '../models/MemberModel.js';
import Submission from '../models/SubmissionModel.js';
import Testimonial from '../models/TestimonialModel.js';

// CORS helper
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Parse request body
async function parseBody(req) {
  if (req.body) return req.body;
  
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Auth helper
async function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { statusCode: 401, message: 'Authentication required' };
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId || decoded.id);
  
  if (!user) {
    throw { statusCode: 401, message: 'User not found' };
  }
  
  return user;
}

// Admin check
async function requireAdmin(req) {
  const user = await getUser(req);
  if (!user.isAdmin && user.role !== 'admin') {
    throw { statusCode: 403, message: 'Admin access required' };
  }
  return user;
}

// Main handler
export default async function handler(req, res) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    
    // Parse body for POST/PUT
    if (['POST', 'PUT'].includes(req.method)) {
      req.body = await parseBody(req);
    }
    
    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = url.pathname.replace('/api', '');
    if (!path.startsWith('/')) path = '/' + path;
    
    const query = Object.fromEntries(url.searchParams);
    
    console.log(`[API] ${req.method} ${path}`);
    
    // Route matching
    const route = `${req.method} ${path}`;
    
    // AUTH ROUTES
    if (route === 'POST /auth/login') {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin || user.role === 'admin'
        }
      });
    }
    
    if (route === 'POST /auth/signup') {
      const { name, email, password, registrationNumber, phone, stream, section, session } = req.body;
      
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      const user = new User({ name, email, password, registrationNumber, phone, stream, section, session });
      await user.save();
      
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin
        }
      });
    }
    
    if (route === 'GET /auth/me') {
      const user = await getUser(req);
      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || user.role === 'admin'
      });
    }
    
    // EVENTS ROUTES
    if (route === 'GET /events') {
      const events = await Event.find().sort({ date: -1 });
      return res.json(events);
    }
    
    if (route.match(/^GET \/events\/[^/]+$/)) {
      const id = path.split('/')[2];
      let event = mongoose.Types.ObjectId.isValid(id) ? await Event.findById(id) : null;
      if (!event) event = await Event.findOne({ slug: id });
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.json(event);
    }
    
    if (route === 'POST /events') {
      await requireAdmin(req);
      const event = new Event(req.body);
      await event.save();
      return res.status(201).json(event);
    }
    
    if (route.match(/^PUT \/events\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const event = await Event.findByIdAndUpdate(id, req.body, { new: true });
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.json(event);
    }
    
    if (route.match(/^DELETE \/events\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const event = await Event.findByIdAndDelete(id);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.json({ message: 'Event deleted' });
    }
    
    // EVENT REGISTRATION
    if (route.match(/^POST \/events\/[^/]+\/register$/)) {
      const eventId = path.split('/')[2];
      const data = req.body;
      
      // Find event
      let event = mongoose.Types.ObjectId.isValid(eventId) ? await Event.findById(eventId) : null;
      if (!event) event = await Event.findOne({ slug: eventId });
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Validate required fields
      const required = ['name', 'registrationNo', 'phoneNumber', 'course', 'section', 'year', 'department'];
      const missing = required.filter(f => !data[f]);
      
      if (missing.length > 0) {
        return res.status(400).json({ message: `Missing: ${missing.join(', ')}` });
      }
      
      // Check duplicate by registration number
      const regNo = data.registrationNo.trim().toUpperCase();
      const existing = await EventRegistration.findOne({
        event: event._id,
        registrationNo: regNo
      });
      
      if (existing) {
        return res.status(400).json({
          message: 'This registration number is already registered for this event',
          error: 'DUPLICATE_REGISTRATION'
        });
      }
      
      // Check duplicate by user (if logged in)
      try {
        const user = await getUser(req);
        const userReg = await EventRegistration.findOne({
          event: event._id,
          user: user._id
        });
        
        if (userReg) {
          return res.status(400).json({
            message: 'You have already registered for this event',
            error: 'DUPLICATE_REGISTRATION'
          });
        }
      } catch (e) {
        // Not logged in, continue
      }
      
      // Create registration
      const registration = new EventRegistration({
        event: event._id,
        user: null,
        name: data.name.trim(),
        registrationNo: regNo,
        phoneNumber: data.phoneNumber.trim(),
        whatsappNumber: data.whatsappNumber?.trim() || data.phoneNumber.trim(),
        section: data.section.trim(),
        department: data.department.trim(),
        year: data.year.trim(),
        course: data.course.trim(),
        isTeamRegistration: data.isTeamRegistration || false,
        teamName: data.teamName?.trim() || null,
        teamMembers: data.teamMembers || [],
        paymentStatus: event.isPaid ? 'pending' : 'free',
        registeredAt: new Date()
      });
      
      await registration.save();
      await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: 1 } });
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        registration: {
          id: registration._id,
          name: registration.name,
          eventTitle: event.title
        }
      });
    }
    
    if (route.match(/^GET \/events\/[^/]+\/registrations$/)) {
      await requireAdmin(req);
      const eventId = path.split('/')[2];
      
      let event = mongoose.Types.ObjectId.isValid(eventId) ? await Event.findById(eventId) : null;
      if (!event) event = await Event.findOne({ slug: eventId });
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const registrations = await EventRegistration.find({ event: event._id })
        .populate('user', 'name email')
        .sort({ registeredAt: -1 });
      
      return res.json(registrations);
    }
    
    if (route.match(/^GET \/events\/[^/]+\/check-registration$/)) {
      try {
        const eventId = path.split('/')[2];
        const user = await getUser(req);
        
        let event = mongoose.Types.ObjectId.isValid(eventId) ? await Event.findById(eventId) : null;
        if (!event) event = await Event.findOne({ slug: eventId });
        
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        
        const registration = await EventRegistration.findOne({
          event: event._id,
          user: user._id
        });
        
        return res.json({ isRegistered: !!registration, registration });
      } catch (e) {
        return res.json({ isRegistered: false });
      }
    }
    
    if (route === 'GET /events/user/registrations') {
      const user = await getUser(req);
      const registrations = await EventRegistration.find({ user: user._id })
        .populate('event')
        .sort({ registeredAt: -1 });
      return res.json(registrations);
    }
    
    // MEMBERS ROUTES
    if (route === 'GET /members') {
      const members = await Member.find().sort({ order: 1 });
      return res.json(members);
    }
    
    if (route === 'POST /members') {
      await requireAdmin(req);
      const member = new Member(req.body);
      await member.save();
      return res.status(201).json(member);
    }
    
    if (route.match(/^PUT \/members\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const member = await Member.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return res.json(member);
    }
    
    if (route.match(/^DELETE \/members\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const member = await Member.findByIdAndDelete(id);
      
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return res.json({ message: 'Member deleted' });
    }
    
    // SUBMISSIONS ROUTES
    if (route === 'POST /submissions') {
      const submission = new Submission({
        ...req.body,
        status: 'pending',
        submittedAt: new Date()
      });
      await submission.save();
      
      return res.status(201).json({
        success: true,
        message: 'Join request submitted successfully!',
        submission
      });
    }
    
    if (route === 'GET /submissions') {
      await requireAdmin(req);
      const submissions = await Submission.find().sort({ submittedAt: -1 });
      return res.json(submissions);
    }
    
    if (route.match(/^PUT \/submissions\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const submission = await Submission.findByIdAndUpdate(id, req.body, { new: true });
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      return res.json(submission);
    }
    
    // GALLERY ROUTES
    if (route === 'GET /gallery') {
      const gallery = await Gallery.find().sort({ createdAt: -1 });
      return res.json(gallery);
    }
    
    if (route === 'POST /gallery') {
      await requireAdmin(req);
      const item = new Gallery(req.body);
      await item.save();
      return res.status(201).json(item);
    }
    
    if (route.match(/^DELETE \/gallery\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const item = await Gallery.findByIdAndDelete(id);
      
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      return res.json({ message: 'Gallery item deleted' });
    }
    
    // TESTIMONIALS ROUTES
    if (route === 'GET /testimonials') {
      const testimonials = await Testimonial.find({ status: 'approved' }).sort({ createdAt: -1 });
      return res.json(testimonials);
    }
    
    if (route === 'GET /testimonials/all') {
      await requireAdmin(req);
      const testimonials = await Testimonial.find().sort({ createdAt: -1 });
      return res.json(testimonials);
    }
    
    if (route === 'POST /testimonials/submit') {
      const testimonial = new Testimonial({ ...req.body, status: 'pending' });
      await testimonial.save();
      return res.status(201).json({ message: 'Testimonial submitted for approval' });
    }
    
    if (route.match(/^PUT \/testimonials\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true });
      
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      return res.json(testimonial);
    }
    
    if (route.match(/^DELETE \/testimonials\/[^/]+$/)) {
      await requireAdmin(req);
      const id = path.split('/')[2];
      const testimonial = await Testimonial.findByIdAndDelete(id);
      
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      return res.json({ message: 'Testimonial deleted' });
    }
    
    // HEALTH CHECK
    if (route === 'GET /health') {
      return res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      });
    }
    
    // 404 - Route not found
    return res.status(404).json({
      message: 'GET endpoint not found',
      method: req.method,
      path: path,
      availableRoutes: [
        'GET /auth/me',
        'GET /events',
        'GET /events/:id',
        'GET /events/:id/check-registration',
        'GET /events/user/registrations',
        'GET /events/:id/registrations',
        'GET /members',
        'GET /submissions',
        'GET /gallery',
        'GET /testimonials',
        'GET /testimonials/all',
        'GET /health'
      ]
    });
    
  } catch (error) {
    console.error('[API Error]', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
