const { storeHourlyEmissions } = require('./dbservice');
const { fetchPowerConsumption, fetchCarbonIntensity, calculateCarbonEmissions } = require('./service');
const CarbonEmission = require('./model');
const logger = require('../../logs/logger');
const { format } = require('date-fns');

async function checkHealth(req, res) {
}

async function updateCarbonEmissions(req = null, res = null) {
  try {
    logger.info('Starting fetch data and calculate emissions');

    const hourlyPowerConsumption = await fetchPowerConsumption();
    const hourlyCarbonIntensity = await fetchCarbonIntensity();
    const hourlyEmissions = await calculateCarbonEmissions(hourlyPowerConsumption, hourlyCarbonIntensity);

    if(hourlyEmissions.length === 0){
      if (res) {
          res.status(204).json({ message: 'No data available to store.' });
      }
      return;
    }

    await storeHourlyEmissions(hourlyEmissions);

    const latestRecord = await CarbonEmission.findOne().sort({ datetime: -1 }).exec();
    const updatedAt = latestRecord ? format(latestRecord.datetime, 'yyyy-MM-dd HH:mm') : format(new Date(), 'yyyy-MM-dd HH:mm');

    if (res) {
      res.status(200).json({ updatedAt: updatedAt });
    }
  } catch(error) {
    logger.error('Error fetching and storing hourly emissions data:', { error: error.message });

    if (res) {
        res.status(500).json({ error: error.message });
    }
  }
}

async function getHourlyEmissions(req, res) {
}

module.exports = {
  checkHealth,
  updateCarbonEmissions,
  getHourlyEmissions,
};
