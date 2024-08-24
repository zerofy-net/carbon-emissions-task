const express = require('express');
const { fetchAndStoreHourlyData, getDailyEmissions, checkHealth } = require('./controller');
const router = express.Router();

router.get('/health', checkHealth);
router.post('/emissions/update', fetchAndStoreHourlyData);
router.get('/emissions/:date', getDailyEmissions);

module.exports = router;
