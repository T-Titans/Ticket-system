const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auth routes loaded successfully' });
});

// Registration endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', login);

module.exports = router;
