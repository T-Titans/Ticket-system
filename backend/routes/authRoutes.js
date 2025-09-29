// directory: backend/routes
// filename: authRoutes.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\routes\authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user || user.status === 'deleted') {
      await createAuditLog({
        userId: user?.id || null,
        action: 'FAILED_LOGIN',
        resource: 'auth',
        details: { email, reason: 'User not found' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await createAuditLog({
        userId: user.id,
        action: 'FAILED_LOGIN',
        resource: 'auth',
        details: { email, reason: 'Invalid password' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: `Account is ${user.status}. Please contact administrator.` 
      });
    }

    // Update last login
    await user.update({ 
      lastLogin: new Date(),
      lastActivity: new Date()
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const userResponse = user.toJSON();
    userResponse.name = user.getFullName();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, department } = req.body;

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      department,
      userType: 'employee',
      role: 'user',
      status: 'pending' // Requires admin approval
    });

    const userResponse = user.toJSON();
    userResponse.name = user.getFullName();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account pending approval.',
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userResponse = req.user.toJSON();
    userResponse.name = req.user.getFullName();
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await createAuditLog({
      userId: req.user.id,
      action: 'LOGOUT',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;