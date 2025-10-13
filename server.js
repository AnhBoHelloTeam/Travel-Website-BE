require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDatabases } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting (relaxed in development and for read-only endpoints)
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 500, // higher threshold to reduce false positives
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  });

  // Conditional limiter: skip public read-heavy endpoints
  app.use('/api/', (req, res, next) => {
    const isReadOnly = req.method === 'GET' && (
      req.path.startsWith('/schedules') ||
      req.path.startsWith('/routes') ||
      req.path.startsWith('/admin')
    );
    if (isReadOnly) return next();
    return limiter(req, res, next);
  });
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Travel Website API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes (will be added step by step)
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/business', require('./routes/business'));
app.use('/api/routes', require('./routes/routes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabases();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
