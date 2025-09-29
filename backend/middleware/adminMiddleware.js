// directory: backend/middleware
// filename: adminMiddleware.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\middleware\adminMiddleware.js
import User from '../models/User.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const adminRoles = ['super_admin', 'admin', 'support_lead'];
    if (!adminRoles.includes(user.role) && !adminRoles.includes(user.userType)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    req.userRole = user.role || user.userType;
    next();
  } catch (e) {
    console.error('Admin middleware error:', e);
    res.status(500).json({ success: false, message: 'Server error in admin authentication' });
  }
};