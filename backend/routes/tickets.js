import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Tickets endpoint (placeholder)' });
});

export default router;