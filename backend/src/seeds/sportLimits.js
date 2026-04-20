import mongoose from 'mongoose';
import Sport from '../models/Sport.js';

// Sport player limits
const SPORT_PLAYER_LIMITS = {
  cricket: 11,
  football: 11,
  volleyball: 6,
  basketball: 5,
  kabaddi: 7,
  tennis: 2,
  shuttle: 2,
};

async function seedSportLimits() {
  try {
    console.log('Updating sport player limits...');
    for (const [slug, limit] of Object.entries(SPORT_PLAYER_LIMITS)) {
      const result = await Sport.updateOne(
        { slug },
        { $set: { playerLimit: limit } },
        { upsert: false }
      );
      console.log(`✓ ${slug}: updated ${result.modifiedCount} sport(s) with limit ${limit}`);
    }
    console.log('Sport player limits updated successfully');
  } catch (error) {
    console.error('Error seeding sport limits:', error);
  }
}

export default seedSportLimits;
