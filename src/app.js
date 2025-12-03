const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Routes
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Serve the main HTML file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../huancaleaks.html'));
});

// Serve Static Frontend (if we decide to serve it from here)
// For now, we just assume the HTML files are in the root and served separately or we can serve them here.
// Let's serve the current directory as static for simplicity so they can access localhost:3000/huancaleaks.html
app.use(express.static(path.join(__dirname, '../')));

module.exports = app;
