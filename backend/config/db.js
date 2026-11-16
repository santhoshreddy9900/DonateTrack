const mongoose = require('mongoose');
const { seedInitialDataIfNeeded } = require('../utils/seedData');

let isConnected = false;
let memoryServerInstance = null;
let activeHost = 'Disconnected';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. If explicit Atlas or remote URI is configured, try connecting with retry logic
  if (uri && !uri.includes('username:password') && uri !== 'in-memory') {
    const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');
    const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
    const maxRetries = isAtlas ? 5 : 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Connecting to MongoDB ${isAtlas ? 'Atlas' : 'Server'} (Attempt ${attempt}/${maxRetries})...`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: isLocal ? 3000 : 15000, // 15s for Atlas
          connectTimeoutMS: 20000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
        });

        isConnected = true;
        activeHost = conn.connection.host;
        console.log(`✅ MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);

        await seedInitialDataIfNeeded();
        return conn;
      } catch (error) {
        console.warn(`⚠️ Connection attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // progressive backoff: 2s, 4s, 6s...
          console.log(`Retrying in ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    console.error('❌ All Atlas connection attempts failed. Falling back to in-memory DB.');
  }

  // 2. Fallback to in-memory MongoDB for local dev without Atlas
  try {
    console.log('⚡ Starting In-Memory MongoDB Server as fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();

    const conn = await mongoose.connect(memUri);
    isConnected = true;
    activeHost = conn.connection.host;
    console.log(`✅ In-Memory MongoDB running at: ${memUri}`);

    await seedInitialDataIfNeeded();
    return conn;
  } catch (memError) {
    isConnected = false;
    activeHost = 'Not Connected';
    console.error(`❌ In-Memory MongoDB failed: ${memError.message}`);
  }
};

const getDBStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  host: activeHost,
  name: mongoose.connection.name || 'donatetrack',
  mode: memoryServerInstance ? 'In-Memory (Local Fallback)' : 'MongoDB Atlas'
});

module.exports = { connectDB, getDBStatus };
