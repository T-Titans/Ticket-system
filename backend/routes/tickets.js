import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  closeTicket
} from '../controllers/ticketController.js';

const router = express.Router();

// All ticket routes require authentication
router.use(authenticateToken);

// Validation rules
const createTicketValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn([
      'Hardware', 'Software', 'Network', 'Security', 
      'Account & Access', 'Email & Communication', 
      'Printing', 'Mobile Device', 'Server & Infrastructure', 'Other'
    ])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority'),
  body('urgency')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Emergency'])
    .withMessage('Invalid urgency')
];

// Routes
router.post('/', createTicketValidation, createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);
router.patch('/:id/assign', assignTicket);
router.patch('/:id/close', closeTicket);

export default router;