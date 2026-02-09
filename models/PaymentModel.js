import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  paymentId: String,
  signature: String,
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registration: { type: mongoose.Schema.Types.ObjectId, ref: 'EventRegistration' },
  
  // User details (denormalized for easy access)
  userName: { type: String, required: true },
  userEmail: String,
  registrationNo: String,
  phoneNumber: String,
  
  // Payment details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
paymentSchema.index({ event: 1, user: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
