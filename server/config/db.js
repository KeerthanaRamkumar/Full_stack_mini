import mongoose from 'mongoose';

/**
 * MongoDB Connection Handler
 * Connects to the local MongoDB Community Server instance specified in MONGO_URI.
 * Defaults to: mongodb://127.0.0.1:27017/blog_platform
 */
let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog_platform';
  
  try {
    console.log(`[Database] Attempting connection to MongoDB: ${uri}`);
    // Short timeout allows quick fallback to local store if local mongod daemon is not running yet
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    
    isMongoConnected = true;
    console.log(`[Database] ✓ Connected to local MongoDB instance: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] ℹ Local MongoDB instance not reachable (${error.message}).`);
    console.warn(`[Database] ℹ Falling back to local file-based persistent store (server/data/local_db.json).`);
    console.warn(`[Database] ℹ To use MongoDB Community Server, ensure 'mongod' is running on port 27017.`);
    return false;
  }
};

export const getDbStatus = () => ({
  connected: isMongoConnected,
  type: isMongoConnected ? 'mongodb' : 'local_json_store',
  uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog_platform',
});
