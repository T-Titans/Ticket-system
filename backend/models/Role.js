// directory: backend/models
// filename: Role.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\models\Role.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  displayName: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  permissions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  color: { type: DataTypes.STRING, defaultValue: 'primary' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

export default Role;