const express = require('express');
const { updateCarbonEmissions, getDailyEmissions, checkHealth } = require('./controller');
const router = express.Router();

router.get('/health', checkHealth);
router.post('/emissions/update', updateCarbonEmissions);
router.get('/emissions/:date', getDailyEmissions);

module.exports = router;
