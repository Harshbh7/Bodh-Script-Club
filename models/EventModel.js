import mongoose from 'mongoose';

// Function to generate URL-friendly slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // URL-friendly version of title
  description: String,
  shortDescription: { type: String, maxlength: 150 }, // Short description for cards
  date: Date,
  time: String,
  location: String,
  image: String,
  tags: [String],
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  maxAttendees: Number,
  registrationCount: { type: Number, default: 0 },

  // Event Type
  eventType: { 
    type: String, 
    enum: ['workshop', 'meeting', 'hackathon', 'bootcamp', 'webinar', 'tech-training', 'coding-class', 'other'], 
    default: 'other' 
  },

  // Team settings (for hackathons)
  teamSettings: {
    enabled: { type: Boolean, default: false },
    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 4 }
  },

  // Payment fields
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },

  // Gallery for event images
  gallery: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to generate slug from title
eventSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug already exists and append number if needed
    while (await mongoose.models.Event.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
