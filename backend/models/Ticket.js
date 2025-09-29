import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000]
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Hardware',
      'Software',
      'Network',
      'Security',
      'Account & Access',
      'Email & Communication',
      'Printing',
      'Mobile Device',
      'Server & Infrastructure',
      'Other'
    ),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM(
      'Open',
      'In Progress', 
      'Pending User',
      'Pending Approval',
      'On Hold',
      'Resolved',
      'Closed',
      'Cancelled'
    ),
    allowNull: false,
    defaultValue: 'Open'
  },
  urgency: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Emergency'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  impact: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assetTag: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  estimatedResolutionTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualResolutionTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  satisfactionRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedbackComments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (ticket) => {
      // Generate unique ticket ID
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      ticket.ticketId = `TK-${timestamp}-${random}`;
    }
  }
});

export default Ticket;