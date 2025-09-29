import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

export default router;