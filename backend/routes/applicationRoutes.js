const express = require('express');
const { storage } = require('../config/localStorage');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const applications = await storage.find('applications');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
