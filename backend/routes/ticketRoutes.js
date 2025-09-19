const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket');
const ticketRoutes = require('./routes/ticketRoutes');

app.use('/api/tickets', ticketRoutes);




// PATCH /api/tickets/:id
// Only support agents can update status or assign tickets
router.patch('/:id', authMiddleware, async (req, res) => {
  const ticketId = req.params.id;
  const updates = req.body;

  try {
    // Only support agents can update status or assign
    if (req.user.role !== 'support' && updates.status) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, { new: true });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  module.exports = router;
});
