import 'dotenv/config';
import mongoose from 'mongoose';
import Sport from '../models/Sport.js';

const sports = [
  { name: 'Cricket', slug: 'cricket', icon: '🏏' },
  { name: 'Football', slug: 'football', icon: '⚽' },
  { name: 'Basketball', slug: 'basketball', icon: '🏀' },
  { name: 'Volleyball', slug: 'volleyball', icon: '🏐' },
  { name: 'Kabaddi', slug: 'kabaddi', icon: '🤼' },
  { name: 'Shuttle', slug: 'shuttle', icon: '🏸' },
  { name: 'Tennis', slug: 'tennis', icon: '🎾' },
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
