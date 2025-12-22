const multer = require('multer');
const PDFAnalyzer = require('../services/pdfAnalyzer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
}).array('files', 5);

const analyzePDF = async (req, res) => {
  try {
    // Handle file upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const results = [];
      
      // Process each file
      for (const file of req.files) {
        try {
          const analysisResult = await PDFAnalyzer.analyzePDF(
            file.buffer,
            file.originalname
          );
          results.push(analysisResult);
        } catch (fileError) {
          results.push({
            fileName: file.originalname,
            error: fileError.message,
            totalPages: 0,
            printedPageSequence: [],
            pageSummary: []
          });
        }
      }

      res.json({ results });
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  analyzePDF
};