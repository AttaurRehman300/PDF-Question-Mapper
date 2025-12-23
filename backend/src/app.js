const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin:  ['https://pdf-question-mapper-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Routes - PROJECT REQUIREMENT: POST /api/analyze-pdf
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'PDF Question Mapper API',
    timestamp: new Date().toISOString()
  });
});

// Root route - FIX for Vercel "/" error
app.get('/', (req, res) => {
  res.json({
    message: 'PDF Question Mapper API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analyzePDF: 'POST /api/pdf/analyze',
      uploads: 'MAX 5 PDFs, 10MB each'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Maximum file size is 10MB'
    });
  }
  
  res.status(500).json({
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['GET /', 'GET /api/health', 'POST /api/pdf/analyze']
  });
});

// Vercel requires module.exports, NOT app.listen()
module.exports = app;

// Local development only (won't run on Vercel)
// if (require.main === module) {
//   const PORT = process.env.PORT || 5000;
  
//   // Optional MongoDB
//   if (process.env.MONGODB_URI) {
//     const mongoose = require('mongoose');
//     mongoose.connect(process.env.MONGODB_URI)
//       .then(() => console.log('✅ MongoDB connected'))
//       .catch(err => console.log('⚠️ MongoDB not connected'));
//   }
  
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//   });
// }
