const axios = require('axios');
const cron = require('node-cron');
const { storeHourlyEmissions, getDailyEmissionsFromDB } = require('./dbservice');
const { fetchPowerConsumption, fetchCarbonIntensity, calculateCarbonEmissions } = require('./service');
const CarbonEmission = require('./model');
const logger = require('../../logs/logger');
const { format, isValid, parseISO } = require('date-fns');

async function checkHealth(req, res) {
  try {
      logger.info('Starting health check for Electricity Maps API');
      const response = await axios.get(process.env.API_URL + 'health');

      logger.info('Electricity Maps API health check succeeded', {
          apiStatus: response.data.status,
          apiMonitors: response.data.monitors,
        });

      const healthCheck = {
          serverStatus: 'OK',
          apiStatus: response.data.status || 'Unknown',
          apiMonitors: response.data.monitors || {},
      };

      res.status(200).send(healthCheck);
  } catch (error) {
      logger.error('Error checking Electricity Maps API health', {
          message: error.message,
          stack: error.stack,
      });

      const healthCheck = {
          serverStatus: 'OK',
          apiStatus: 'Unavailable',
          errorMessage: error.message,
      };

      res.status(500).json(healthCheck);
  }
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

async function getDailyEmissions(req, res) {
  try {
    const { date } = req.params;

    const parsedDate = parseISO(date);
    if (!isValid(parsedDate) || date.length !== 10) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const hourlyEmissions = await getDailyEmissionsFromDB(date);

    const totalEmissionsPerDay = hourlyEmissions.reduce((acc, emission) => acc + (emission || 0), 0);

    res.status(200).json({
        date,
        totalEmissionsPerDay,
        hourlyEmissions,
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
}

cron.schedule('0 * * * *', updateCarbonEmissions);

module.exports = {
  checkHealth,
  updateCarbonEmissions,
  getDailyEmissions,
};
