-- Supabase PostgreSQL Database Setup for IT Support Ticket System
-- Professional system: Users must register before login
-- Login support: Email OR Phone Number + Password

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table with proper professional structure
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic Information (Required for Registration)
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL UNIQUE, -- 10 digit phone numbers
    password_hash VARCHAR(255) NOT NULL,
    
    -- Role and Access
    user_type VARCHAR(50) NOT NULL DEFAULT 'visitor' CHECK (user_type IN ('visitor', 'employee', 'it_specialist', 'admin')),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'support_agent', 'admin', 'super_admin')),
    
    -- Optional Employee Information
    department VARCHAR(100),
    office_location VARCHAR(100),
    desk_number VARCHAR(50),
    employee_id VARCHAR(50) UNIQUE,
    company VARCHAR(255),
    visit_purpose TEXT,
    admin_level VARCHAR(50) DEFAULT 'standard',
    
    -- Account Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Security
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Create Tickets table
CREATE TABLE tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Ticket Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General Inquiry' CHECK (category IN (
        'Hardware Issues', 'Software Problems', 'Network Connectivity',
        'Password Reset', 'Account Access', 'Email Issues', 
        'Printer Problems', 'System Performance', 'Security Incident',
        'General Inquiry', 'Other'
    )),
    subcategory VARCHAR(255),
    
    -- Priority and Status
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled')),
    urgency VARCHAR(20) DEFAULT 'Medium' CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
    
    -- Relationships
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Dates
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for tickets
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- Create Ticket Comments table
CREATE TABLE ticket_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ticket comments
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);

-- Create Sessions table for session management
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Create Audit Logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL CHECK (action IN (
        'REGISTER', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
        'PASSWORD_CHANGE', 'PASSWORD_RESET',
        'CREATE_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET',
        'ASSIGN_TICKET', 'RESOLVE_TICKET', 'CLOSE_TICKET',
        'UPDATE_PROFILE', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'
    )),
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own tickets" ON tickets FOR UPDATE USING (auth.uid() = created_by);

-- IT specialists and admins can view all tickets
CREATE POLICY "IT specialists can view all tickets" ON tickets FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND user_type IN ('it_specialist', 'admin')
    )
);

-- Ticket comments policies
CREATE POLICY "Users can view comments on their tickets" ON ticket_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM tickets 
        WHERE id = ticket_id 
        AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND user_type IN ('admin')
    )
);

-- Insert default admin user (for system setup)
INSERT INTO users (
    first_name, last_name, email, phone_number, password_hash,
    user_type, role, department, status, email_verified, employee_id
) VALUES (
    'System', 'Administrator', 'admin@capaciti.com', '0123456789',
    -- Password: 'Admin123456!' (hashed with bcrypt)
    '$2b$12$LQv3c1yqBwEHxv/X/7lhYuZjfx7aYe7d5QZ2GFr0a.tgLB9jW1F/y',
    'admin', 'super_admin', 'IT', 'active', true, 'ADMIN001'
);

-- Create view for user statistics
CREATE VIEW user_stats AS
SELECT 
    user_type,
    COUNT(*) as user_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_count
FROM users 
GROUP BY user_type;

-- Create view for ticket statistics
CREATE VIEW ticket_stats AS
SELECT 
    status,
    priority,
    COUNT(*) as ticket_count
FROM tickets 
GROUP BY status, priority
ORDER BY 
    CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 WHEN 'Low' THEN 4 END,
    CASE status WHEN 'Open' THEN 1 WHEN 'In Progress' THEN 2 WHEN 'Pending' THEN 3 WHEN 'Resolved' THEN 4 WHEN 'Closed' THEN 5 END;

-- Grant necessary permissions for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant read permissions for anon role (for registration/login)
GRANT SELECT, INSERT ON users TO anon;
GRANT SELECT, INSERT ON sessions TO anon;
GRANT INSERT ON audit_logs TO anon;

COMMENT ON TABLE users IS 'Professional user management with email/phone login support';
COMMENT ON TABLE tickets IS 'IT support ticket system with role-based access';
COMMENT ON TABLE sessions IS 'User session management for authentication';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security';

-- Display setup completion
SELECT 'Supabase Database Setup Complete!' as status,
       'Professional registration required before login' as registration_policy,
       'Login with email OR phone number + password' as login_method;