-- Complete Enterprise IT Support System Database Tables
-- Execute this in your Supabase SQL editor

-- 1. First add the missing auto_created column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;

-- 2. Asset Management Tables
CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(50),
    room VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    support_contract BOOLEAN DEFAULT false,
    contract_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Advanced Asset Management
CREATE TABLE IF NOT EXISTS asset_maintenance_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    frequency_days INTEGER NOT NULL,
    last_maintenance DATE,
    next_maintenance DATE GENERATED ALWAYS AS (last_maintenance + INTERVAL '1 day' * frequency_days) STORED,
    assigned_technician UUID REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_maintenance_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id),
    maintenance_type VARCHAR(100) NOT NULL,
    performed_date DATE NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    parts_used TEXT[],
    next_scheduled_date DATE,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Knowledge Base System
CREATE TABLE IF NOT EXISTS knowledge_base_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES knowledge_base_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_base_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_tags (
    article_id UUID REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES knowledge_base_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 5. Advanced Ticket System
CREATE TABLE IF NOT EXISTS ticket_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    department_id UUID REFERENCES departments(id),
    default_priority VARCHAR(20) DEFAULT 'medium',
    auto_assign_group UUID REFERENCES departments(id),
    sla_response_hours INTEGER DEFAULT 24,
    sla_resolution_hours INTEGER DEFAULT 72,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    is_solution BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Service Level Agreements (SLA)
CREATE TABLE IF NOT EXISTS sla_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    response_time_hours INTEGER NOT NULL,
    resolution_time_hours INTEGER NOT NULL,
    escalation_time_hours INTEGER,
    business_hours_only BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_sla_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sla_policy_id UUID REFERENCES sla_policies(id),
    response_due TIMESTAMP WITH TIME ZONE,
    resolution_due TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    response_breached BOOLEAN DEFAULT false,
    resolution_breached BOOLEAN DEFAULT false,
    escalated BOOLEAN DEFAULT false,
    escalated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Communication System
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- email, sms, push, in-app
    subject VARCHAR(200),
    body TEXT NOT NULL,
    variables TEXT[], -- JSON array of available variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- 8. Analytics and Reporting
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- tickets, assets, users, performance
    query_template TEXT NOT NULL,
    parameters JSONB,
    schedule_enabled BOOLEAN DEFAULT false,
    schedule_frequency VARCHAR(20), -- daily, weekly, monthly
    recipients TEXT[],
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- counter, gauge, histogram
    tags JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX (metric_name, timestamp),
    INDEX (timestamp)
);

-- 9. System Configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_name VARCHAR(100) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    description TEXT,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_roles TEXT[],
    target_departments TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Insert default data
INSERT INTO asset_categories (name, description) VALUES 
('Hardware', 'Physical IT equipment and devices'),
('Software', 'Applications and software licenses'),
('Network', 'Network infrastructure and equipment'),
('Security', 'Security-related assets and systems'),
('Furniture', 'Office furniture and fixtures')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sla_policies (name, description, priority, response_time_hours, resolution_time_hours) VALUES 
('Critical Priority', 'For system-down and critical business impact issues', 'critical', 1, 4),
('High Priority', 'For high-impact issues affecting multiple users', 'high', 2, 8),
('Medium Priority', 'For standard business issues', 'medium', 8, 24),
('Low Priority', 'For minor issues and requests', 'low', 24, 72)
ON CONFLICT (name) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES 
('company_name', 'Capaciti IT Solutions', 'string', 'Company name displayed in the system', true),
('max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', false),
('session_timeout_minutes', '480', 'number', 'User session timeout in minutes', false),
('enable_email_notifications', 'true', 'boolean', 'Enable email notifications system-wide', false),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
('default_theme', 'leopard', 'string', 'Default theme for new users', true)
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO notification_templates (name, type, subject, body, variables) VALUES 
('ticket_created', 'email', 'New Ticket Created: {{ticket_number}}', 
 'Hello {{user_name}},\n\nYour ticket {{ticket_number}} has been created successfully.\n\nSubject: {{ticket_subject}}\nPriority: {{ticket_priority}}\n\nOur team will respond within {{sla_response_time}} hours.\n\nBest regards,\nCapaciti IT Support Team', 
 ARRAY['user_name', 'ticket_number', 'ticket_subject', 'ticket_priority', 'sla_response_time']),
('ticket_assigned', 'email', 'Ticket Assigned: {{ticket_number}}', 
 'Hello {{assignee_name}},\n\nTicket {{ticket_number}} has been assigned to you.\n\nSubject: {{ticket_subject}}\nPriority: {{ticket_priority}}\nDue: {{due_date}}\n\nPlease review and take appropriate action.\n\nBest regards,\nCapaciti IT System', 
 ARRAY['assignee_name', 'ticket_number', 'ticket_subject', 'ticket_priority', 'due_date'])
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON asset_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON asset_locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON asset_vendors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON knowledge_base_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON knowledge_base_tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ticket_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON sla_policies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for public settings" ON system_settings FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

-- Admin-only policies for system management tables
CREATE POLICY "Enable all access for admins" ON system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.name = 'admin'
    )
);

CREATE POLICY "Enable all access for admins" ON feature_flags FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.name = 'admin'
    )
);

-- Success message
SELECT 'Enterprise IT Support System database setup completed successfully!' as result;