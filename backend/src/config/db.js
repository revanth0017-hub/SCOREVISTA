import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    const options = {
      serverSelectionTimeoutMS: 15000,
      family: 4, // Use IPv4; often fixes TLS errors on Windows with Atlas
    };
    await mongoose.connect(uri, options);
    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
