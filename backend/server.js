const express = require('express');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Security
let helmet;
try { helmet = require('helmet'); } catch(e) {}
if (helmet) app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const cors = require('cors');
app.use(cors({ origin: '*' }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/logs', require('./routes/logs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Catch-all: serve frontend for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const filePath = path.join(__dirname, '../frontend', req.path.endsWith('.html') ? req.path : 'index.html');
    res.sendFile(filePath, err => {
      if (err) res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
  }
});

// Connect to DB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to connect to DB:', err.message);
  process.exit(1);
});

module.exports = app;
