import 'dotenv/config';
import mongoose from 'mongoose';
import Sport from '../models/Sport.js';

const sports = [
  { name: 'Cricket', slug: 'cricket', icon: '🏏', adminAssigned: false },
  { name: 'Football', slug: 'football', icon: '⚽', adminAssigned: false },
  { name: 'Basketball', slug: 'basketball', icon: '🏀', adminAssigned: false },
  { name: 'Volleyball', slug: 'volleyball', icon: '🏐', adminAssigned: false },
  { name: 'Kabaddi', slug: 'kabaddi', icon: '🤼', adminAssigned: false },
  { name: 'Shuttle', slug: 'shuttle', icon: '🏸', adminAssigned: false },
  { name: 'Tennis', slug: 'tennis', icon: '🎾', adminAssigned: false },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Sport.deleteMany({});
  await Sport.insertMany(sports);
  console.log('Seeded sports:', sports.length);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
