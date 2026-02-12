import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  description: String,
  mission: String,
  vision: String,
  values: [String],
  achievements: [{
    title: String,
    description: String,
    icon: String
  }],
  stats: [{
    label: String,
    value: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.About || mongoose.model('About', aboutSchema);
