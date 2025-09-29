// directory: backend/utils
// filename: auditLogger.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\utils\auditLogger.js
import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async (logData) => {
  try {
    await AuditLog.create(logData);
  } catch (e) {
    console.error('Failed to create audit log:', e);
  }
};