// directory: backend/models
// filename: User.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\models\User.js
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  firstName: {
    type: DataTypes.STRING, allowNull: false,
    validate: { notEmpty: true, len: [2, 50] }
  },
  lastName: {
    type: DataTypes.STRING, allowNull: false,
    validate: { notEmpty: true, len: [2, 50] }
  },

  email: {
    type: DataTypes.STRING, allowNull: false, unique: true,
    validate: { isEmail: true }
  },

  password: {
    type: DataTypes.STRING, allowNull: false,
    validate: { len: [6, 100] }
  },

  userType: {
    type: DataTypes.ENUM('employee', 'it_specialist', 'visitor', 'admin', 'super_admin', 'support_lead', 'support_agent', 'user', 'guest'),
    allowNull: false, defaultValue: 'employee'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'support_lead', 'support_agent', 'user', 'guest', 'employee', 'it_specialist', 'visitor'),
    allowNull: false, defaultValue: 'user'
  },

  department: {
    type: DataTypes.ENUM('it', 'support', 'sales', 'hr', 'finance', 'operations'),
    allowNull: true
  },

  deskNumber: { type: DataTypes.STRING, allowNull: true },
  officeNumber: { type: DataTypes.STRING, allowNull: true },

  phoneNumber: { type: DataTypes.STRING, allowNull: false },

  employeeId: { type: DataTypes.STRING, allowNull: true, unique: true },

  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending', 'deleted'),
    defaultValue: 'active'
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },

  lastLogin: { type: DataTypes.DATE, allowNull: true },
  lastActivity: { type: DataTypes.DATE, allowNull: true },

  profileImage: { type: DataTypes.STRING, allowNull: true },

  permissions: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

  requirePasswordChange: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerificationToken: { type: DataTypes.STRING, allowNull: true },

  passwordResetToken: { type: DataTypes.STRING, allowNull: true },
  passwordResetExpires: { type: DataTypes.DATE, allowNull: true },

  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  deletedBy: { type: DataTypes.INTEGER, allowNull: true },
  deletedAt: { type: DataTypes.DATE, allowNull: true }
}, {
  timestamps: true,
  paranoid: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

export default User;