// directory: backend/routes
// filename: adminRoutes.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\routes\adminRoutes.js
import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/temp/' });

router.use(authMiddleware);
router.use(adminMiddleware);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/bulk-update', adminController.bulkUpdateUsers);
router.delete('/users/bulk-delete', adminController.bulkDeleteUsers);
router.get('/users/export', adminController.exportUsers);
router.post('/users/import', upload.single('file'), adminController.importUsers);

// Roles
router.get('/roles', adminController.getRoles);
router.post('/roles', adminController.createRole);
router.put('/roles/:id', adminController.updateRole);
router.delete('/roles/:id', adminController.deleteRole);

// Security & Audit (stubs)
router.get('/security/settings', adminController.getSecuritySettings);
router.put('/security/settings', adminController.updateSecuritySettings);
router.get('/security/sessions', adminController.getActiveSessions);
router.delete('/security/sessions/:id', adminController.terminateSession);
router.get('/audit/logs', adminController.getAuditLogs);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/users/activity', adminController.getUserActivity);

// System (stubs)
router.get('/system/health', adminController.getSystemHealth);
router.get('/system/settings', adminController.getSystemSettings);
router.put('/system/settings', adminController.updateSystemSettings);

export default router;