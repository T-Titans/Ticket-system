// directory: backend/controllers
// filename: adminController.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\controllers\adminController.js
import { Op } from 'sequelize';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { exportToCsv } from '../utils/exportUtils.js';
import csv from 'csv-parser';
import fs from 'fs';

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search = '',
      status = '', role = '', department = '',
      sortBy = 'createdAt', sortOrder = 'DESC'
    } = req.query;

    const where = { status: { [Op.ne]: 'deleted' } };

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status && status !== 'all') where.status = status;
    if (role && role !== 'all') where[Op.or] = [{ role }, { userType: role }];
    if (department && department !== 'all') where.department = department;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'VIEW_USERS',
      resource: 'users',
      details: { query: req.query, total: count },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      users: rows.map(u => ({ ...u.toJSON(), name: u.getFullName() })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / parseInt(limit)),
        count,
        limit: parseInt(limit)
      }
    });
  } catch (e) {
    console.error('Get users error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: e.message });
  }
};

// POST /api/admin/users
export const createUser = async (req, res) => {
  try {
    const {
      firstName, lastName, email,
      phoneNumber, phone, department,
      role, userType, status = 'active',
      password, permissions = [],
      sendWelcomeEmail = false,
      requirePasswordChange = true,
      employeeId, deskNumber, officeNumber
    } = req.body;

    const phoneFinal = phoneNumber || phone;

    if (!firstName || !lastName || !email || !password || !phoneFinal) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const newUser = await User.create({
      firstName, lastName, email,
      phoneNumber: phoneFinal,
      department,
      role: role || userType || 'user',
      userType: userType || role || 'employee',
      status,
      password,
      permissions,
      requirePasswordChange,
      employeeId, deskNumber, officeNumber,
      createdBy: req.user.id,
      emailVerified: false
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE_USER',
      resource: 'users',
      resourceId: newUser.id,
      details: { email, role: role || userType, department },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response = newUser.toJSON();
    response.name = newUser.getFullName();

    res.status(201).json({ success: true, message: 'User created successfully', user: response });
  } catch (e) {
    console.error('Create user error:', e);
    res.status(500).json({ success: false, message: 'Failed to create user', error: e.message });
  }
};

// PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.password;
    delete updates.id;
    delete updates.createdAt;

    if (updates.name && (!updates.firstName || !updates.lastName)) {
      const parts = String(updates.name).trim().split(' ');
      updates.firstName = parts.shift() || '';
      updates.lastName = parts.join(' ') || '';
      delete updates.name;
    }

    updates.updatedBy = req.user.id;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.update(updates);

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE_USER',
      resource: 'users',
      resourceId: Number(id),
      details: updates,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const fresh = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    const response = fresh.toJSON();
    response.name = fresh.getFullName();

    res.json({ success: true, message: 'User updated successfully', user: response });
  } catch (e) {
    console.error('Update user error:', e);
    res.status(500).json({ success: false, message: 'Failed to update user', error: e.message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.update({ status: 'deleted', deletedAt: new Date(), deletedBy: req.user.id });

    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE_USER',
      resource: 'users',
      resourceId: Number(id),
      details: { userEmail: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: e.message });
  }
};

// PATCH /api/admin/users/bulk-update
export const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updateData } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0)
      return res.status(400).json({ success: false, message: 'User IDs array is required' });

    if ((updateData?.status === 'inactive' || updateData?.status === 'deleted') && userIds.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate or delete your own account' });
    }

    const payload = { ...updateData, updatedBy: req.user.id, updatedAt: new Date() };
    const [affected] = await User.update(payload, { where: { id: { [Op.in]: userIds } } });

    await createAuditLog({
      userId: req.user.id,
      action: 'BULK_UPDATE_USERS',
      resource: 'users',
      details: { userIds, updateData: payload, affected },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: `${affected} users updated successfully`, modifiedCount: affected });
  } catch (e) {
    console.error('Bulk update users error:', e);
    res.status(500).json({ success: false, message: 'Failed to update users', error: e.message });
  }
};

// DELETE /api/admin/users/bulk-delete
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0)
      return res.status(400).json({ success: false, message: 'User IDs array is required' });

    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const [affected] = await User.update(
      { status: 'deleted', deletedAt: new Date(), deletedBy: req.user.id },
      { where: { id: { [Op.in]: userIds } } }
    );

    await createAuditLog({
      userId: req.user.id,
      action: 'BULK_DELETE_USERS',
      resource: 'users',
      details: { userIds, affected },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: `${affected} users deleted successfully`, modifiedCount: affected });
  } catch (e) {
    console.error('Bulk delete users error:', e);
    res.status(500).json({ success: false, message: 'Failed to delete users', error: e.message });
  }
};

// GET /api/admin/users/export
export const exportUsers = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.query;

    const where = { status: { [Op.ne]: 'deleted' } };
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.role && filters.role !== 'all') where[Op.or] = [{ role: filters.role }, { userType: filters.role }];
    if (filters.department && filters.department !== 'all') where.department = filters.department;

    const users = await User.findAll({
      where,
      attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'department', 'role', 'userType', 'status', 'createdAt', 'lastLogin'],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      const rows = users.map(u => ({
        name: u.getFullName(),
        email: u.email,
        phone: u.phoneNumber || '',
        department: u.department || '',
        role: u.role || u.userType,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
        lastLogin: u.lastLogin ? u.lastLogin.toISOString() : 'Never'
      }));

      const csv = await exportToCsv(rows, [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'department', title: 'Department' },
        { id: 'role', title: 'Role' },
        { id: 'status', title: 'Status' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'lastLogin', title: 'Last Login' }
      ]);

      await createAuditLog({
        userId: req.user.id, action: 'EXPORT_USERS', resource: 'users',
        details: { format, filters, count: users.length }, ipAddress: req.ip, userAgent: req.get('User-Agent')
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      return res.send(csv);
    }

    res.json({ success: true, users: users.map(u => ({ ...u.toJSON(), name: u.getFullName() })) });
  } catch (e) {
    console.error('Export users error:', e);
    res.status(500).json({ success: false, message: 'Failed to export users', error: e.message });
  }
};

// POST /api/admin/users/import - THIS WAS MISSING!
export const importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const users = [];
    const errors = [];
    let processed = 0;
    let created = 0;
    let skipped = 0;

    // Parse CSV file
    const parsePromise = new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          users.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    await parsePromise;

    // Process each user
    for (const userData of users) {
      processed++;
      
      try {
        // Validate required fields
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.phoneNumber) {
          errors.push(`Row ${processed}: Missing required fields`);
          skipped++;
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
          errors.push(`Row ${processed}: User with email ${userData.email} already exists`);
          skipped++;
          continue;
        }

        // Create user
        await User.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          password: userData.password || 'TempPassword@123',
          department: userData.department || null,
          role: userData.role || 'user',
          userType: userData.userType || 'employee',
          status: userData.status || 'pending',
          employeeId: userData.employeeId || null,
          deskNumber: userData.deskNumber || null,
          officeNumber: userData.officeNumber || null,
          requirePasswordChange: true,
          emailVerified: false,
          createdBy: req.user.id
        });

        created++;
      } catch (error) {
        errors.push(`Row ${processed}: ${error.message}`);
        skipped++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Log the import
    await createAuditLog({
      userId: req.user.id,
      action: 'IMPORT_USERS',
      resource: 'users',
      details: { processed, created, skipped, errors: errors.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User import completed',
      statistics: {
        processed,
        created,
        skipped,
        errors: errors.length
      },
      errors: errors.slice(0, 10) // Return only first 10 errors
    });
  } catch (error) {
    console.error('Import users error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({ success: false, message: 'Failed to import users', error: error.message });
  }
};

// Roles and Dashboard
export const getRoles = async (req, res) => {
  try {
    const roles = [
      { id: 'super_admin', name: 'Super Administrator', description: 'Full system access and control', permissions: ['*'], color: 'error' },
      { id: 'admin', name: 'Administrator', description: 'Manage users and system', permissions: ['user_management', 'system_settings', 'reports', 'analytics'], color: 'warning' },
      { id: 'support_lead', name: 'Support Team Lead', description: 'Manage support team', permissions: ['ticket_management', 'team_management', 'reports'], color: 'primary' },
      { id: 'support_agent', name: 'Support Agent', description: 'Handle tickets', permissions: ['ticket_response', 'customer_contact'], color: 'info' },
      { id: 'user', name: 'End User', description: 'Create/view own tickets', permissions: ['ticket_create', 'ticket_view_own'], color: 'success' },
      { id: 'guest', name: 'Guest User', description: 'Limited access', permissions: ['ticket_create_limited'], color: 'default' }
    ];
    res.json({ success: true, roles });
  } catch (e) {
    console.error('Get roles error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch roles', error: e.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const stats = {
      totalUsers: await User.count({ where: { status: { [Op.ne]: 'deleted' } } }),
      activeUsers: await User.count({ where: { status: 'active' } }),
      pendingUsers: await User.count({ where: { status: 'pending' } }),
      suspendedUsers: await User.count({ where: { status: 'suspended' } }),
      todayLogins: await AuditLog.count({ where: { action: 'LOGIN', createdAt: { [Op.gte]: today } } }),
      failedLogins: await AuditLog.count({ where: { action: 'FAILED_LOGIN', createdAt: { [Op.gte]: today } } }),
      recentActivity: await AuditLog.findAll({
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
        order: [['createdAt', 'DESC']], limit: 10
      })
    };

    res.json({ success: true, stats });
  } catch (e) {
    console.error('Get dashboard stats error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: e.message });
  }
};

// Stubs for not-yet-implemented endpoints
export const createRole = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const updateRole = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const deleteRole = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const getPermissions = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const updateUserPermissions = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const getSecuritySettings = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const updateSecuritySettings = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const getActiveSessions = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const terminateSession = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const getAuditLogs = (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' });
export const getUserActivity = (req, res) => res.status(501).json({ success: false, message: 'Not