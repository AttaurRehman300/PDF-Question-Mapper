const express = require('express');
const router = express.Router();
const { analyzePDF } = require('../controllers/pdfController');

// POST /api/pdf/analyze
router.post('/analyze', analyzePDF);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;