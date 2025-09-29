import User from './User.js';
import AuditLog from './AuditLog.js';
import Role from './Role.js';

// Set up associations
User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// Self-referential associations for User
User.belongsTo(User, { as: 'CreatedByUser', foreignKey: 'createdBy' });
User.belongsTo(User, { as: 'UpdatedByUser', foreignKey: 'updatedBy' });
User.belongsTo(User, { as: 'DeletedByUser', foreignKey: 'deletedBy' });

export { User, AuditLog, Role };