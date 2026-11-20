const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const { connectDB, getDBStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// CORS — allow localhost in dev, Vercel URL in production
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
    // Allow requests with no origin (Postman, curl, same-origin on Vercel)
    if (!origin) return callback(null, true);
    // On Vercel, frontend and backend are on the same domain — always allow
    if (process.env.VERCEL === '1') return callback(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
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

// Mount API routes
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/recipients', require('./routes/recipientRoutes'));
app.use('/api/distributions', require('./routes/distributionRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Only start the HTTP server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 DonateTrack Backend running on http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

// Export app for Vercel serverless runtime
module.exports = app;
