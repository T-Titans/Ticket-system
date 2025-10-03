const { initDatabase, storage } = require('../config/localStorage');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  await initDatabase();
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Seed users
  const users = [
    {
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@company.com',
      password_hash: hashedPassword,
      role: 'super_admin',
      phone: '0123456789',
      status: 'active'
    },
    {
      first_name: 'John',
      last_name: 'Recruiter',
      email: 'recruiter@company.com',
      password_hash: hashedPassword,
      role: 'recruiter',
      phone: '0123456788',
      status: 'active'
    },
    {
      first_name: 'Jane',
      last_name: 'Applicant',
      email: 'applicant@example.com',
      password_hash: hashedPassword,
      role: 'applicant',
      phone: '0123456787',
      status: 'active'
    }
  ];

  for (const user of users) {
    const existing = await storage.findOne('users', { email: user.email });
    if (!existing) {
      await storage.insert('users', user);
    }
  }

  // Seed sample job
  const recruiter = await storage.findOne('users', { role: 'recruiter' });
  if (recruiter) {
    const existingJob = await storage.findOne('jobs', { title: 'Software Developer' });
    if (!existingJob) {
      await storage.insert('jobs', {
        title: 'Software Developer',
        description: 'Full-stack developer position',
        department: 'Engineering',
        location: 'Remote',
        employment_type: 'Full-time',
        status: 'open',
        posted_by: recruiter.id
      });
    }
  }

  console.log('✅ Database seeded successfully');
}

seedDatabase().catch(console.error);
