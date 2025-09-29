// directory: backend/scripts
// filename: seedAdmin.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\scripts\seedAdmin.js
import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from '../config/database.js';
import '../models/associations.js';
import User from '../models/User.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@gmail.com' },
      defaults: {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@gmail.com',
        password: 'Admin@123',
        phoneNumber: '0000000000',
        role: 'super_admin',
        userType: 'super_admin',
        status: 'active',
        permissions: ['*']
      }
    });

    console.log(created ? 'Admin created' : 'Admin already exists');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();