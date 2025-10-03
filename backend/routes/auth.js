const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Database connection
const getConnection = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ticket_system'
    });
};

// Universal login function
const loginUser = async (email, password) => {
    try {
        const connection = await getConnection();
        
        // First, try to find existing user
        const [users] = await connection.execute(
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
            
            const [result] = await connection.execute(`
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
            const [newUsers] = await connection.execute(
                'SELECT * FROM Users WHERE id = ?',
                [result.insertId]
            );
            user = newUsers[0];
        }
        
        await connection.end();
        
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }
        
        // For universal login, accept any password
        const passwordValid = user.allowUniversalLogin || await bcrypt.compare(password, user.password);
        
        if (!passwordValid) {
            return { success: false, message: 'Invalid email or password' };
        }
        
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

module.exports = router;