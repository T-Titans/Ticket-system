const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Universal password for development
const UNIVERSAL_PASSWORD = 'password';
const UNIVERSAL_PASSWORD_HASH = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

// Check if email is Gmail
const isGmailEmail = (email) => {
    return email.toLowerCase().endsWith('@gmail.com');
};

// Auto-create user for Gmail emails
const autoCreateGmailUser = async (email) => {
    try {
        const emailParts = email.split('@')[0].split('.');
        const firstName = emailParts[0] || 'Gmail';
        const lastName = emailParts[1] || 'User';
        
        const query = `
            INSERT INTO Users (
                firstName, lastName, email, password, phoneNumber,
                userType, role, department, status, emailVerified,
                permissions, allowUniversalLogin, isAutoCreated
            ) VALUES (?, ?, ?, ?, '0000000000', 'employee', 'user', 'sales', 'active', TRUE, 
                     '["ticket_create", "ticket_view_own"]', TRUE, TRUE)
        `;
        
        const [result] = await db.execute(query, [
            firstName.charAt(0).toUpperCase() + firstName.slice(1),
            lastName.charAt(0).toUpperCase() + lastName.slice(1),
            email,
            UNIVERSAL_PASSWORD_HASH
        ]);
        
        // Log the auto-creation
        const auditQuery = `
            INSERT INTO AuditLogs (userId, action, resource, details, ipAddress)
            VALUES (?, 'AUTO_CREATED_USER', 'users', ?, ?)
        `;
        await db.execute(auditQuery, [
            result.insertId,
            JSON.stringify({ email, autoCreated: true }),
            'system'
        ]);
        
        return result.insertId;
    } catch (error) {
        console.error('Error auto-creating Gmail user:', error);
        return null;
    }
};

// Enhanced login function
const loginUser = async (email, password) => {
    try {
        // First, try to find existing user
        const [users] = await db.execute(
            'SELECT * FROM Users WHERE email = ? AND status = "active"',
            [email]
        );
        
        let user = users[0];
        
        // If user doesn't exist and it's a Gmail email, auto-create
        if (!user && isGmailEmail(email)) {
            const newUserId = await autoCreateGmailUser(email);
            if (newUserId) {
                const [newUsers] = await db.execute(
                    'SELECT * FROM Users WHERE id = ?',
                    [newUserId]
                );
                user = newUsers[0];
            }
        }
        
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }
        
        // Check password
        let passwordValid = false;
        
        if (user.allowUniversalLogin) {
            // Universal login: accept any password OR the universal password
            passwordValid = true; // Accept any password for universal login users
        } else {
            // Regular password check
            passwordValid = await bcrypt.compare(password, user.password);
        }
        
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

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Support middleware
const supportMiddleware = (req, res, next) => {
    if (req.user.role !== 'support_agent' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Support privileges required.'
        });
    }
    next();
};

module.exports = {
    loginUser,
    authMiddleware,
    adminMiddleware,
    supportMiddleware,
    isGmailEmail,
    autoCreateGmailUser
};