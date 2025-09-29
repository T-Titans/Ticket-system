// directory: backend/routes
// filename: userRoutes.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\routes\userRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const userResponse = req.user.toJSON();
    userResponse.name = req.user.getFullName();
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, deskNumber, officeNumber } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (deskNumber !== undefined) updateData.deskNumber = deskNumber;
    if (officeNumber !== undefined) updateData.officeNumber = officeNumber;
    
    await req.user.update(updateData);
    
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    const userResponse = updatedUser.toJSON();
    userResponse.name = updatedUser.getFullName();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;