import mongoose from 'mongoose';

/** Connect to MongoDB if MONGODB_URI is set. The API keeps working (in-memory store) if it is not. */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.warn('[db] MONGODB_URI not set - using in-memory storage.'); return false; }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[db] MongoDB connected.');
    return true;
  } catch (err) {
    console.warn(`[db] MongoDB unavailable (${err.message}) - using in-memory storage.`);
    return false;
  }
}
