// Script to add slugs to existing events
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/EventModel.js';

dotenv.config();

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

async function addSlugsToEvents() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all events without slugs
    const events = await Event.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] });
    
    console.log(`\n📋 Found ${events.length} events without slugs`);

    if (events.length === 0) {
      console.log('✅ All events already have slugs!');
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        let baseSlug = generateSlug(event.title);
        let slug = baseSlug;
        let counter = 1;

        // Check if slug already exists
        while (await Event.findOne({ slug, _id: { $ne: event._id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        event.slug = slug;
        await event.save();
        
        console.log(`✅ Updated: "${event.title}" → /events/${slug}`);
        updated++;
      } catch (error) {
        console.error(`❌ Failed to update "${event.title}":`, error.message);
        skipped++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Skipped: ${skipped}`);
    console.log(`   📝 Total: ${events.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSlugsToEvents();
