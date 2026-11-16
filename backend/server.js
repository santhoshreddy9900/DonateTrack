const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST before any other imports that might need them
dotenv.config();

const { connectDB, getDBStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// CORS — permissive in dev, restricted in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    return callback(null, false); // silently reject instead of throwing
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'OK',
    service: 'DonateTrack API',
    timestamp: new Date(),
    database: dbStatus
  });
});

// Mount modular API routes
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/recipients', require('./routes/recipientRoutes'));
app.use('/api/distributions', require('./routes/distributionRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 DonateTrack Backend running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
