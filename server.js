require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const formidable = require('formidable'); // For file uploads
const path = require('path');
const { router: userRoutes, authenticate } = require('./routes/userRoutes'); // Import auth middleware and routes

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Static files (for serving uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File Upload Route
app.post('/upload', authenticate, (req, res) => {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(__dirname, 'uploads'),
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'File upload error', error: err });
    }
    const uploadedFiles = Object.values(files).map(file => file.newFilename);
    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  });
});

// Logbook Entry Route (Protected with Token Authentication)
app.post('/api/users/logbook', authenticate, (req, res) => {
  const { entry } = req.body;

  if (!entry) {
    return res.status(400).json({ message: 'Log entry cannot be empty' });
  }

  // In a real-world scenario, you would save this to a database.
  res.status(201).json({ message: 'Log entry added successfully', entry });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Integrate the user authentication routes
app.use('/api/users', userRoutes);

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





