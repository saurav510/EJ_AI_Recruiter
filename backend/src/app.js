const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');

const jdRoutes = require('./routes/jdRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const matchRoutes = require('./routes/matchRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const outreachRoutes = require('./routes/outreachRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — support comma-separated origins (e.g. local + Vercel)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server (no origin) or listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EJ Recruit AI API is running 🚀', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jd', protect, jdRoutes);
app.use('/api/resume', protect, resumeRoutes);
app.use('/api/match', protect, matchRoutes);
app.use('/api/interview', protect, interviewRoutes);
app.use('/api/outreach', protect, outreachRoutes);
app.use('/api/copilot', protect, copilotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
