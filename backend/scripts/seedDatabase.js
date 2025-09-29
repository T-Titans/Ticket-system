// directory: backend/scripts
// filename: seedDatabase.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\scripts\seedDatabase.js
import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../config/database.js';
import '../models/associations.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const seedDatabase = async () => {
  try {
    // Connect to MariaDB
    await sequelize.authenticate();
    console.log('✅ Connected to MariaDB');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: true }); // WARNING: This drops existing tables
    console.log('🗃️ Database tables created/reset');

    // Create Super Admin
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Administrator',
      email: 'admin@capaciti.com',
      password: 'Admin@123',
      phoneNumber: '0123456789',
      role: 'super_admin',
      userType: 'super_admin',
      status: 'active',
      department: 'it',
      employeeId: 'EMP001',
      emailVerified: true,
      permissions: ['*']
    });

    // Create IT Support Lead
    const supportLead = await User.create({
      firstName: 'IT Support',
      lastName: 'Lead',
      email: 'support-lead@capaciti.com',
      password: 'Support@123',
      phoneNumber: '0123456788',
      role: 'support_lead',
      userType: 'support_lead',
      status: 'active',
      department: 'it',
      employeeId: 'EMP002',
      emailVerified: true,
      permissions: ['ticket_management', 'team_management', 'reports'],
      createdBy: superAdmin.id
    });

    // Create Support Agent
    const supportAgent = await User.create({
      firstName: 'Support',
      lastName: 'Agent',
      email: 'support@capaciti.com',
      password: 'Agent@123',
      phoneNumber: '0123456787',
      role: 'support_agent',
      userType: 'support_agent',
      status: 'active',
      department: 'support',
      employeeId: 'EMP003',
      emailVerified: true,
      permissions: ['ticket_response', 'customer_contact'],
      createdBy: superAdmin.id
    });

    // Create Regular Admin
    const admin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@system.com',
      password: 'Admin@456',
      phoneNumber: '0123456786',
      role: 'admin',
      userType: 'admin',
      status: 'active',
      department: 'it',
      employeeId: 'EMP004',
      emailVerified: true,
      permissions: ['user_management', 'system_settings', 'reports'],
      createdBy: superAdmin.id
    });

    // Create Employee Users
    const employee1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@capaciti.com',
      password: 'User@123',
      phoneNumber: '0123456785',
      role: 'user',
      userType: 'employee',
      status: 'active',
      department: 'sales',
      employeeId: 'EMP005',
      deskNumber: 'D-101',
      officeNumber: 'O-201',
      emailVerified: true,
      permissions: ['ticket_create', 'ticket_view_own'],
      createdBy: admin.id
    });

    const employee2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@capaciti.com',
      password: 'User@456',
      phoneNumber: '0123456784',
      role: 'user',
      userType: 'employee',
      status: 'active',
      department: 'hr',
      employeeId: 'EMP006',
      deskNumber: 'D-102',
      officeNumber: 'O-202',
      emailVerified: true,
      permissions: ['ticket_create', 'ticket_view_own'],
      createdBy: admin.id
    });

    // Create IT Specialist
    const itSpecialist = await User.create({
      firstName: 'Tech',
      lastName: 'Specialist',
      email: 'tech@capaciti.com',
      password: 'Tech@123',
      phoneNumber: '0123456783',
      role: 'support_agent',
      userType: 'it_specialist',
      status: 'active',
      department: 'it',
      employeeId: 'EMP007',
      emailVerified: true,
      permissions: ['ticket_management', 'system_access'],
      createdBy: supportLead.id
    });

    // Create Visitor (Guest User)
    const visitor = await User.create({
      firstName: 'Guest',
      lastName: 'Visitor',
      email: 'visitor@guest.com',
      password: 'Guest@123',
      phoneNumber: '0123456782',
      role: 'guest',
      userType: 'visitor',
      status: 'active',
      emailVerified: false,
      permissions: ['ticket_create_limited'],
      createdBy: admin.id
    });

    // Create some pending users (awaiting approval)
    const pendingUser = await User.create({
      firstName: 'Pending',
      lastName: 'User',
      email: 'pending@capaciti.com',
      password: 'Pending@123',
      phoneNumber: '0123456781',
      role: 'user',
      userType: 'employee',
      status: 'pending',
      department: 'finance',
      employeeId: 'EMP008',
      emailVerified: false,
      permissions: []
    });

    // Create inactive user
    const inactiveUser = await User.create({
      firstName: 'Inactive',
      lastName: 'User',
      email: 'inactive@capaciti.com',
      password: 'Inactive@123',
      phoneNumber: '0123456780',
      role: 'user',
      userType: 'employee',
      status: 'inactive',
      department: 'operations',
      employeeId: 'EMP009',
      emailVerified: true,
      permissions: ['ticket_create', 'ticket_view_own'],
      createdBy: admin.id
    });

    // Create some audit logs for demonstration
    const auditLogs = [
      {
        userId: superAdmin.id,
        action: 'LOGIN',
        resource: 'auth',
        details: { email: superAdmin.email, loginTime: new Date() },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: superAdmin.id,
        action: 'CREATE_USER',
        resource: 'users',
        resourceId: admin.id,
        details: { email: admin.email, role: 'admin' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: admin.id,
        action: 'CREATE_USER',
        resource: 'users',
        resourceId: employee1.id,
        details: { email: employee1.email, role: 'user' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: supportLead.id,
        action: 'LOGIN',
        resource: 'auth',
        details: { email: supportLead.email, loginTime: new Date() },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: employee1.id,
        action: 'LOGIN',
        resource: 'auth',
        details: { email: employee1.email, loginTime: new Date() },
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    await AuditLog.bulkCreate(auditLogs);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔑 SUPER ADMIN:');
    console.log('   📧 Email: admin@capaciti.com');
    console.log('   🔒 Password: Admin@123');
    console.log('   👤 Role: Super Administrator');
    console.log('');
    console.log('🛠️ SUPPORT LEAD:');
    console.log('   📧 Email: support-lead@capaciti.com');
    console.log('   🔒 Password: Support@123');
    console.log('   👤 Role: Support Team Lead');
    console.log('');
    console.log('🎧 SUPPORT AGENT:');
    console.log('   📧 Email: support@capaciti.com');
    console.log('   🔒 Password: Agent@123');
    console.log('   👤 Role: Support Agent');
    console.log('');
    console.log('⚙️ ADMIN:');
    console.log('   📧 Email: admin@system.com');
    console.log('   🔒 Password: Admin@456');
    console.log('   👤 Role: Administrator');
    console.log('');
    console.log('👨‍💼 EMPLOYEES:');
    console.log('   📧 Email: john.doe@capaciti.com / Password: User@123');
    console.log('   📧 Email: jane.smith@capaciti.com / Password: User@456');
    console.log('');
    console.log('🔧 IT SPECIALIST:');
    console.log('   📧 Email: tech@capaciti.com');
    console.log('   🔒 Password: Tech@123');
    console.log('   👤 Role: IT Specialist');
    console.log('');
    console.log('👥 VISITOR:');
    console.log('   📧 Email: visitor@guest.com');
    console.log('   🔒 Password: Guest@123');
    console.log('   👤 Role: Guest/Visitor');
    console.log('');
    console.log('📊 DATABASE STATS:');
    console.log(`   👥 Total Users: ${await User.count()}`);
    console.log(`   ✅ Active Users: ${await User.count({ where: { status: 'active' } })}`);
    console.log(`   ⏳ Pending Users: ${await User.count({ where: { status: 'pending' } })}`);
    console.log(`   ❌ Inactive Users: ${await User.count({ where: { status: 'inactive' } })}`);
    console.log(`   📝 Audit Logs: ${await AuditLog.count()}`);
    console.log('═══════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

seedDatabase();