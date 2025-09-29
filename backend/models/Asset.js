import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetTag: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'Desktop',
      'Laptop',
      'Server',
      'Printer',
      'Scanner',
      'Monitor',
      'Phone',
      'Tablet',
      'Network Equipment',
      'Software License',
      'Other'
    ),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'Active',
      'Inactive',
      'Under Maintenance',
      'Retired',
      'Lost/Stolen',
      'Disposed'
    ),
    allowNull: false,
    defaultValue: 'Active'
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  warrantyExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (asset) => {
      if (!asset.assetTag) {
        const typePrefix = asset.type.substring(0, 2).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        asset.assetTag = `${typePrefix}-${timestamp}-${random}`;
      }
    }
  }
});

export default Asset;