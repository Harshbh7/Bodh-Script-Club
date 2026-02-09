import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  registrationNo: String,
  phoneNumber: String,
  whatsappNumber: String,
  section: String,
  department: String,
  year: String,
  course: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Payment fields
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'free'], default: 'free' },
  
  registeredAt: { type: Date, default: Date.now }
});

export default mongoose.models.EventRegistration || mongoose.model('EventRegistration', registrationSchema);
