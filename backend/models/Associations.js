// directory: backend/models
// filename: associations.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\models\associations.js
import User from './User.js';
import AuditLog from './AuditLog.js';
import Role from './Role.js';

// Logs
User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// Self-referential
User.belongsTo(User, { as: 'CreatedByUser', foreignKey: 'createdBy' });
User.belongsTo(User, { as: 'UpdatedByUser', foreignKey: 'updatedBy' });
User.belongsTo(User, { as: 'DeletedByUser', foreignKey: 'deletedBy' });

export { User, AuditLog, Role };