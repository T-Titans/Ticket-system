-- Create database
CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

-- Create users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'support') DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS Tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    createdBy INT NOT NULL,
    assignedTo INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
);

-- Insert a default admin user (password is 'admin123' - hashed)
INSERT IGNORE INTO Users (name, email, password, role) VALUES 
('Admin User', 'admin@ticket-system.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.w3jxO/3Ml9J9Q5KXIKJ4o1AKdKfawK', 'support');