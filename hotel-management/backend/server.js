const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const hotelRoutes = require('./routes/hotelRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded hotel images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/hotels', hotelRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware for Multer and general errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large! Maximum allowed image size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ message: err.message || 'An unexpected error occurred.' });
  }

  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` Hotel Management API Server Running`);
  console.log(` Port: ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Static Uploads: http://localhost:${PORT}/uploads`);
  console.log(`========================================`);
});
