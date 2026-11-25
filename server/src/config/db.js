import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://localhost:27017/bookd';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || DEFAULT_URI;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection to MongoDB failed: ${error.message}`);
    console.warn(`[Database Warning] Set a valid MONGO_URI in server/.env (e.g. MongoDB Atlas replica set URI).`);
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (error) {
    console.error(`[Database Error] Error during disconnect: ${error.message}`);
  }
};
