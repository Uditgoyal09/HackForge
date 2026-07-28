const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(morgan('dev'));

// Base Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HackVerse API is running'
  });
});

// Routes (to be added)

// Error Handler Middleware
app.use(errorHandler);

module.exports = { app };
