// directory: backend/models
// filename: AuditLog.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\models\AuditLog.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  userId: { type: DataTypes.INTEGER, allowNull: false },

  action: {
    type: DataTypes.ENUM(
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'BULK_UPDATE_USERS', 'BULK_DELETE_USERS',
      'VIEW_USERS', 'EXPORT_USERS', 'IMPORT_USERS',
      'CREATE_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET',
      'CHANGE_PASSWORD', 'RESET_PASSWORD',
      'UPDATE_SETTINGS', 'VIEW_REPORTS'
    ),
    allowNull: false
  },

  resource: { type: DataTypes.STRING, allowNull: false },
  resourceId: { type: DataTypes.INTEGER, allowNull: true },

  details: { type: DataTypes.JSON, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.TEXT, allowNull: true }
}, {
  timestamps: true,
  updatedAt: false
});

export default AuditLog;