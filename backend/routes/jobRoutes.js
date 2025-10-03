const express = require('express');
const { storage } = require('../config/localStorage');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const jobs = await storage.find('jobs');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
