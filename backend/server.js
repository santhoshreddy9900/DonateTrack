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

// CORS — in Vercel Services, frontend and backend share the same public domain,
// so all browser requests arrive with no cross-origin header (same origin).
// We also allow localhost for local dev.
app.use(cors({
  origin: function (origin, callback) {
    // No origin = same-origin requests (Vercel production) or curl/Postman
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ];
    if (process.env.FRONTEND_URL) allowed.push(process.env.FRONTEND_URL);
    if (allowed.some((o) => origin.startsWith(o))) return callback(null, true);
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

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'OK',
    service: 'DonateTrack API',
    timestamp: new Date(),
    database: dbStatus
  });
});

// API routes
app.use('/api/donations',     require('./routes/donationRoutes'));
app.use('/api/recipients',    require('./routes/recipientRoutes'));
app.use('/api/distributions', require('./routes/distributionRoutes'));
app.use('/api/inventory',     require('./routes/inventoryRoutes'));
app.use('/api/reports',       require('./routes/reportRoutes'));

// 404 for unknown API paths
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Always start the HTTP server — Vercel Services runs Express as a
// long-running process (not serverless), so app.listen() is required.
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 DonateTrack Backend running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Export for local testing / unit tests
module.exports = app;
