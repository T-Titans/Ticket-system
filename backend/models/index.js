import User from './User.js';
import Ticket from './Ticket.js';
import Asset from './Asset.js';
import Department from './Department.js';

// Define associations
User.hasMany(Ticket, { foreignKey: 'requesterId', as: 'requestedTickets' });
User.hasMany(Ticket, { foreignKey: 'assignedToId', as: 'assignedTickets' });
User.hasMany(Asset, { foreignKey: 'assignedToId', as: 'assignedAssets' });
User.belongsTo(Department, { foreignKey: 'department', targetKey: 'name' });

Ticket.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Ticket.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

Asset.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedUser' });

Department.hasMany(User, { foreignKey: 'department', sourceKey: 'name' });
Department.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

export {
  User,
  Ticket,
  Asset,
  Department
};