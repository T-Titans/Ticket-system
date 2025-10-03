const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  deleteTicket,
  getTicketStats,
  addComment,
  getComments
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Stats route (must be before /:id)
router.get('/stats', getTicketStats);

// Main CRUD routes
router.get('/', getAllTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

// Assign ticket
router.patch('/:id/assign', assignTicket);

// Comments
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

module.exports = router;
