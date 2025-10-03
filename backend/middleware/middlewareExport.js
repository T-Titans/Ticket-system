const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Universal login function
const loginUser = async (email, password) => {
    try {
        // First, try to find existing user
        const [users] = await db.execute(
            'SELECT * FROM Users WHERE email = ? AND status = "active"',
            [email]
        );
        
        let user = users[0];
        
        // If user doesn't exist and it's a Gmail email, auto-create
        if (!user && email.toLowerCase().endsWith('@gmail.com')) {
            const emailParts = email.split('@')[0].split('.');
            const firstName = emailParts[0] || 'Gmail';
            const lastName = emailParts[1] || 'User';
            
            const hashedPassword = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
            
            const [result] = await db.execute(`
                INSERT INTO Users (
                    firstName, lastName, email, password, phoneNumber,
                    userType, role, department, status, emailVerified,
                    permissions, allowUniversalLogin, isAutoCreated
                ) VALUES (?, ?, ?, ?, '0000000000', 'employee', 'user', 'sales', 'active', TRUE, 
                         '["ticket_create", "ticket_view_own"]', TRUE, TRUE)
            `, [
                firstName.charAt(0).toUpperCase() + firstName.slice(1),
                lastName.charAt(0).toUpperCase() + lastName.slice(1),
                email,
                hashedPassword
            ]);
            
            // Get the newly created user
            const [newUsers] = await db.execute(
                'SELECT * FROM Users WHERE id = ?',
                [result.insertId]
            );
            user = newUsers[0];
        }
        
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }
        
        // For universal login, accept any password
        const passwordValid = user.allowUniversalLogin || await bcrypt.compare(password, user.password);
        
        if (!passwordValid) {
            return { success: false, message: 'Invalid email or password' };
        }
        
        // Update last login
        await db.execute(
            'UPDATE Users SET lastLogin = NOW(), lastActivity = NOW() WHERE id = ?',
            [user.id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role,
                userType: user.userType 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        delete user.password;
        
        return {
            success: true,
            token,
            user: {
                ...user,
                fullName: `${user.firstName} ${user.lastName}`
            }
        };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed' };
    }
};

// JWT Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get fresh user data
        const [users] = await db.execute(
            'SELECT id, email, role, userType, status FROM Users WHERE id = ? AND status = "active"',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }
        
        req.user = {
            userId: users[0].id,
            email: users[0].email,
            role: users[0].role,
            userType: users[0].userType
        };
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    const result = await loginUser(email, password);
    
    if (result.success) {
        res.json({
            success: true,
            message: 'Login successful',
            token: result.token,
            user: result.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: result.message
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

module.exports = router;