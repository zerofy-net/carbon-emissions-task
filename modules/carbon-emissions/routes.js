const express = require('express');
const { updateCarbonEmissions, getHourlyEmissions, checkHealth } = require('./controller');
const router = express.Router();

router.get('/health', checkHealth);
router.post('/emissions/update', updateCarbonEmissions);
router.get('/emissions/:date', getHourlyEmissions);

module.exports = router;
