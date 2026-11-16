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
    const maxRetries = isAtlas ? 4 : 2;
    const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Connecting to MongoDB ${isAtlas ? 'Atlas' : 'Server'} (Attempt ${attempt}/${maxRetries})...`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: isLocal ? 2000 : 8000,
        });

        isConnected = true;
        activeHost = conn.connection.host;
        console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
        
        await seedInitialDataIfNeeded();
        return conn;
      } catch (error) {
        console.warn(`⚠️ Connection attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
  }

  // 2. Fallback to in-memory MongoDB for local evaluation and testing
  try {
    console.log(`⚡ Initializing In-Memory MongoDB Server as fallback...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();

    const conn = await mongoose.connect(memUri);
    isConnected = true;
    activeHost = conn.connection.host;
    console.log(`✅ In-Memory MongoDB Server running at: ${memUri}`);
    
    await seedInitialDataIfNeeded();
    return conn;
  } catch (memError) {
    isConnected = false;
    activeHost = 'Not Connected';
    console.error(`❌ In-Memory MongoDB Error: ${memError.message}`);
  }
};

const getDBStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  host: activeHost,
  name: mongoose.connection.name || 'donatetrack',
  mode: memoryServerInstance ? 'In-Memory (Local Fallback)' : 'MongoDB Atlas'
});

module.exports = { connectDB, getDBStatus };
