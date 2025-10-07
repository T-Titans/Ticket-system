import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// ✅ CORS Configuration - Improved
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5001',  // Add the new port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://172.20.6.153:3000',
  'http://172.20.6.153:3001'
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// ✅ Routes
app.use('/api/auth', authRoutes);

// ✅ Health check - improved response
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ MongoDB Atlas Connection - with better error handling
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Remove deprecated options and add retry logic
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 Tip: Check if your IP is whitelisted in MongoDB Atlas');
  process.exit(1);
});

// MongoDB connection event listeners
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// ✅ Improved error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin not allowed',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler - improved
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});