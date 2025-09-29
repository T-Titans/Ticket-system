// directory: backend/config
// filename: database.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\config\database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'ticket_system',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: process.env.DB_DIALECT || 'mariadb',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false
  }
);