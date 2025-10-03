const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, firstName, lastName, email, phoneNumber, userType, role, 
                   department, status, emailVerified, lastLogin, createdAt,
                   CASE WHEN allowUniversalLogin THEN 'Universal' ELSE 'Secure' END as loginMode
            FROM Users 
            WHERE status != 'deleted'
            ORDER BY createdAt DESC
        `);
        
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, firstName, lastName, email, phoneNumber, userType, role,
                   department, status, emailVerified, lastLogin, profileImage,
                   allowUniversalLogin, isAutoCreated
            FROM Users 
            WHERE id = ?
        `, [req.user.userId]);
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
});

// Create new user (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { 
            firstName, lastName, email, password, phoneNumber,
            userType, role, department, employeeId
        } = req.body;
        
        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM Users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password || 'password', 12);
        
        // Insert new user
        const [result] = await db.execute(`
            INSERT INTO Users (
                firstName, lastName, email, password, phoneNumber,
                userType, role, department, employeeId, status, 
                emailVerified, allowUniversalLogin, createdBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', TRUE, TRUE, ?)
        `, [
            firstName, lastName, email, hashedPassword, phoneNumber,
            userType || 'employee', role || 'user', department, 
            employeeId, req.user.userId
        ]);
        
        // Log the creation
        await db.execute(`
            INSERT INTO AuditLogs (userId, action, resource, resourceId, details)
            VALUES (?, 'CREATE_USER', 'users', ?, ?)
        `, [
            req.user.userId,
            result.insertId,
            JSON.stringify({ email, userType: userType || 'employee' })
        ]);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: result.insertId
        });
        
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});

// Update user (Admin or own profile)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        const isOwnProfile = req.user.userId === userId;
        
        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        const { 
            firstName, lastName, phoneNumber, department,
            userType, role, status 
        } = req.body;
        
        let updateFields = [];
        let updateValues = [];
        
        // Fields anyone can update (own profile)
        if (firstName) {
            updateFields.push('firstName = ?');
            updateValues.push(firstName);
        }
        if (lastName) {
            updateFields.push('lastName = ?');
            updateValues.push(lastName);
        }
        if (phoneNumber) {
            updateFields.push('phoneNumber = ?');
            updateValues.push(phoneNumber);
        }
        
        // Admin-only fields
        if (isAdmin) {
            if (department) {
                updateFields.push('department = ?');
                updateValues.push(department);
            }
            if (userType) {
                updateFields.push('userType = ?');
                updateValues.push(userType);
            }
            if (role) {
                updateFields.push('role = ?');
                updateValues.push(role);
            }
            if (status) {
                updateFields.push('status = ?');
                updateValues.push(status);
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        updateFields.push('updatedBy = ?', 'updatedAt = NOW()');
        updateValues.push(req.user.userId, userId);
        
        await db.execute(`
            UPDATE Users SET ${updateFields.join(', ')} WHERE id = ?
        `, updateValues);
        
        // Log the update
        await db.execute(`
            INSERT INTO AuditLogs (userId, action, resource, resourceId, details)
            VALUES (?, 'UPDATE_USER', 'users', ?, ?)
        `, [
            req.user.userId,
            userId,
            JSON.stringify(req.body)
        ]);
        
        res.json({
            success: true,
            message: 'User updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

// Delete user (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        
        // Soft delete
        await db.execute(`
            UPDATE Users 
            SET status = 'deleted', deletedBy = ?, deletedAt = NOW()
            WHERE id = ?
        `, [req.user.userId, userId]);
        
        // Log the deletion
        await db.execute(`
            INSERT INTO AuditLogs (userId, action, resource, resourceId, details)
            VALUES (?, 'DELETE_USER', 'users', ?, ?)
        `, [
            req.user.userId,
            userId,
            JSON.stringify({ softDelete: true })
        ]);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

module.exports = router;