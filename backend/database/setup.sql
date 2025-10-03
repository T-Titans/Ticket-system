-- Enhanced Ticket System Database Setup with Universal Login
-- Supports: Visitor, Employee, IT Specialist, Admin roles
-- DEVELOPMENT MODE: Universal Gmail login enabled

CREATE DATABASE IF NOT EXISTS ticket_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticket_system;

-- Disable foreign key checks to allow clean table recreation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in correct order
DROP TABLE IF EXISTS Sessions;
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS TicketComments;
DROP TABLE IF EXISTS Tickets;
DROP TABLE IF EXISTS Users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create comprehensive Users table with universal login support
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Information
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(firstName, ' ', lastName)) STORED,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL,
    
    -- Role and User Type
    userType ENUM(
        'visitor',          -- External guests/visitors
        'employee',         -- Regular company employees
        'it_specialist',    -- IT department specialists
        'admin',            -- System administrators
        'super_admin',      -- Super administrators
        'support_lead',     -- Support team leads
        'support_agent'     -- Support agents
    ) NOT NULL DEFAULT 'employee',
    
    role ENUM(
        'guest',            -- Visitor role
        'user',             -- Employee role
        'support_agent',    -- IT Specialist/Support role
        'admin',            -- Administrator role
        'super_admin'       -- Super Administrator role
    ) NOT NULL DEFAULT 'user',
    
    -- Department and Location
    department ENUM(
        'it', 'support', 'sales', 'hr', 'finance',
        'operations', 'marketing', 'management'
    ) NULL,
    
    deskNumber VARCHAR(50) NULL,
    officeNumber VARCHAR(50) NULL,
    employeeId VARCHAR(50) NULL UNIQUE,
    
    -- Status and Permissions
    status ENUM('active', 'inactive', 'suspended', 'pending', 'deleted') DEFAULT 'active',
    permissions JSON NULL DEFAULT ('[]'),
    
    -- Universal Login Settings
    allowUniversalLogin BOOLEAN DEFAULT TRUE,
    isAutoCreated BOOLEAN DEFAULT FALSE,
    
    -- Security and Verification
    emailVerified BOOLEAN DEFAULT TRUE,
    emailVerificationToken VARCHAR(255) NULL,
    passwordResetToken VARCHAR(255) NULL,
    passwordResetExpires DATETIME NULL,
    requirePasswordChange BOOLEAN DEFAULT FALSE,
    
    -- Activity Tracking
    lastLogin DATETIME NULL,
    lastActivity DATETIME NULL,
    loginAttempts INT DEFAULT 0,
    accountLockedUntil DATETIME NULL,
    
    -- Profile
    profileImage VARCHAR(255) NULL,
    
    -- Audit Fields
    createdBy INT NULL,
    updatedBy INT NULL,
    deletedBy INT NULL,
    deletedAt DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_userType (userType),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_employeeId (employeeId),
    INDEX idx_lastLogin (lastLogin),
    INDEX idx_createdAt (createdAt),
    INDEX idx_allowUniversalLogin (allowUniversalLogin)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create enhanced Tickets table
CREATE TABLE Tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Ticket Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM(
        'Hardware Issues',
        'Software Problems', 
        'Network Connectivity',
        'Password Reset',
        'Account Access',
        'Email Issues',
        'Printer Problems',
        'System Performance',
        'Security Incident',
        'General Inquiry',
        'Other'
    ) NOT NULL DEFAULT 'Other',
    
    subcategory VARCHAR(255) NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled') DEFAULT 'Open',
    
    -- Relationships
    createdBy INT NOT NULL,
    assignedTo INT NULL,
    departmentId VARCHAR(50) NULL,
    
    -- Additional Fields
    urgency ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    impact ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    
    -- Resolution
    resolution TEXT NULL,
    resolvedAt DATETIME NULL,
    closedAt DATETIME NULL,
    
    -- Dates
    dueDate DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_createdBy (createdBy),
    INDEX idx_assignedTo (assignedTo),
    INDEX idx_createdAt (createdAt),
    INDEX idx_dueDate (dueDate)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Ticket Comments table
CREATE TABLE TicketComments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticketId INT NOT NULL,
    userId INT NOT NULL,
    comment TEXT NOT NULL,
    isInternal BOOLEAN DEFAULT FALSE,
    attachments JSON NULL DEFAULT ('[]'),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticketId) REFERENCES Tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT,
    
    INDEX idx_ticketId (ticketId),
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Audit Logs table
CREATE TABLE AuditLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    action ENUM(
        'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
        'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
        'BULK_UPDATE_USERS', 'BULK_DELETE_USERS',
        'VIEW_USERS', 'EXPORT_USERS', 'IMPORT_USERS',
        'CREATE_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET',
        'ASSIGN_TICKET', 'RESOLVE_TICKET', 'CLOSE_TICKET',
        'CHANGE_PASSWORD', 'RESET_PASSWORD',
        'UPDATE_SETTINGS', 'VIEW_REPORTS',
        'AUTO_CREATED_USER'
    ) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resourceId INT NULL,
    details JSON NULL,
    ipAddress VARCHAR(45) NULL,
    userAgent TEXT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_userId (userId),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_createdAt (createdAt),
    INDEX idx_user_action (userId, action)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Sessions table for session management
CREATE TABLE Sessions (
    id VARCHAR(128) PRIMARY KEY,
    userId INT NOT NULL,
    ipAddress VARCHAR(45) NULL,
    userAgent TEXT NULL,
    lastActivity DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_userId (userId),
    INDEX idx_expiresAt (expiresAt),
    INDEX idx_isActive (isActive),
    INDEX idx_lastActivity (lastActivity)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default users with UNIVERSAL PASSWORD: "password" (works for any login)
-- Universal password hash for 'password': $2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO Users (
    firstName, lastName, email, password, phoneNumber, 
    userType, role, department, status, emailVerified, 
    permissions, employeeId, allowUniversalLogin, isAutoCreated
) VALUES 

-- Super Administrator
('Super', 'Administrator', 'admin@capaciti.com', 
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456789', 'super_admin', 'super_admin', 'it', 'active', TRUE,
 '["*"]', 'ADMIN001', TRUE, FALSE),

-- IT Specialist/Admin
('IT', 'Specialist', 'it@capaciti.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456788', 'it_specialist', 'admin', 'it', 'active', TRUE,
 '["user_management", "ticket_management", "system_settings", "reports"]', 'IT001', TRUE, FALSE),

-- Support Lead
('Support', 'Lead', 'support-lead@capaciti.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456787', 'support_lead', 'admin', 'support', 'active', TRUE,
 '["ticket_management", "team_management", "reports"]', 'SUP001', TRUE, FALSE),

-- Support Agent
('Support', 'Agent', 'support@capaciti.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456786', 'support_agent', 'support_agent', 'support', 'active', TRUE,
 '["ticket_response", "customer_contact"]', 'SUP002', TRUE, FALSE),

-- Regular Employee (Sales)
('John', 'Doe', 'john.doe@capaciti.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456785', 'employee', 'user', 'sales', 'active', TRUE,
 '["ticket_create", "ticket_view_own"]', 'EMP001', TRUE, FALSE),

-- Regular Employee (HR)
('Jane', 'Smith', 'jane.smith@capaciti.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456784', 'employee', 'user', 'hr', 'active', TRUE,
 '["ticket_create", "ticket_view_own"]', 'EMP002', TRUE, FALSE),

-- Visitor/Guest User
('Guest', 'Visitor', 'visitor@guest.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0123456783', 'visitor', 'guest', NULL, 'active', TRUE,
 '["ticket_create_limited"]', NULL, TRUE, FALSE),

-- Universal Gmail Template User (for auto-creation)
('Gmail', 'User', 'template@gmail.com',
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 '0000000000', 'employee', 'user', 'sales', 'active', TRUE,
 '["ticket_create", "ticket_view_own"]', NULL, TRUE, TRUE);

-- Add foreign key constraints to Users table after data insertion
ALTER TABLE Users 
ADD CONSTRAINT fk_users_created_by FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updatedBy) REFERENCES Users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_deleted_by FOREIGN KEY (deletedBy) REFERENCES Users(id) ON DELETE SET NULL;

-- Insert sample tickets
INSERT INTO Tickets (title, description, category, priority, status, createdBy, assignedTo) VALUES 

('Computer won''t start', 
 'My workstation computer is not turning on. The power button doesn''t respond and there are no lights.',
 'Hardware Issues', 'High', 'Open',
 (SELECT id FROM Users WHERE email = 'john.doe@capaciti.com'),
 (SELECT id FROM Users WHERE email = 'it@capaciti.com')),

('Cannot access WiFi network',
 'I am a visitor and cannot connect to the guest WiFi network. The password provided doesn''t work.',
 'Network Connectivity', 'Medium', 'In Progress',
 (SELECT id FROM Users WHERE email = 'visitor@guest.com'),
 (SELECT id FROM Users WHERE email = 'support@capaciti.com')),

('Forgot email password',
 'I cannot remember my email password and need it to be reset urgently for work.',
 'Password Reset', 'High', 'Resolved',
 (SELECT id FROM Users WHERE email = 'jane.smith@capaciti.com'),
 (SELECT id FROM Users WHERE email = 'support@capaciti.com')),

('Need Adobe Photoshop installed',
 'I require Adobe Photoshop for my design work. Please install the latest version.',
 'Software Problems', 'Low', 'Open',
 (SELECT id FROM Users WHERE email = 'john.doe@capaciti.com'),
 NULL);

-- Insert sample audit logs
INSERT INTO AuditLogs (userId, action, resource, details, ipAddress) VALUES
((SELECT id FROM Users WHERE email = 'admin@capaciti.com'),
 'LOGIN', 'auth',
 '{"loginTime": "2024-01-01 09:00:00", "successful": true}',
 '192.168.1.100'),
((SELECT id FROM Users WHERE email = 'john.doe@capaciti.com'),
 'CREATE_TICKET', 'tickets',
 '{"ticketId": 1, "category": "Hardware Issues"}',
 '192.168.1.101');

-- Display setup summary
SELECT 'Enhanced Database Setup Complete with Universal Login!' as Status;

-- Show user accounts created
SELECT 
    CONCAT('👤 ', userType) as 'User Type',
    role as 'Role',
    department as 'Department',
    status as 'Status',
    CONCAT(firstName, ' ', lastName) as 'Name',
    email as 'Email',
    CASE WHEN allowUniversalLogin THEN '🔓 Universal' ELSE '🔒 Secure' END as 'Login Mode'
FROM Users 
ORDER BY 
    CASE userType
        WHEN 'super_admin' THEN 1
        WHEN 'it_specialist' THEN 2
        WHEN 'support_lead' THEN 3
        WHEN 'support_agent' THEN 4
        WHEN 'employee' THEN 5
        WHEN 'visitor' THEN 6
    END;

-- Show summary statistics
SELECT 'Total Users' as Metric, COUNT(*) as Count FROM Users
UNION ALL
SELECT 'Total Tickets', COUNT(*) FROM Tickets
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM AuditLogs
UNION ALL
SELECT 'Universal Login Users', COUNT(*) FROM Users WHERE allowUniversalLogin = TRUE;

-- Show login instructions
SELECT '🔐 UNIVERSAL LOGIN ENABLED' as 'Login Info',
       'Any Gmail email + password "password"' as 'How to Login',
       'Auto-creates new users for valid Gmail addresses' as 'Feature';

COMMIT;