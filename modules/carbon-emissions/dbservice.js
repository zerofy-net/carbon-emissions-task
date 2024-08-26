const logger = require('../../logs/logger');
const CarbonEmission = require('./model');
const { startOfDay, endOfDay, parseISO } = require('date-fns');

async function storeHourlyEmissions(emissions) {
    logger.info('Checking for new emissions');

    const newEmissions = [];
    
    for (const emission of emissions){
        try {
            const existingRecord = await CarbonEmission.findOne({ datetime: emission.datetime });
            if(!existingRecord || existingRecord.carbonEmission !== emission.carbonEmission) {
                newEmissions.push(emission);
            }
        } catch(error) {
            logger.error('Error querying the database:', { error: err.message });
            throw new Error('Database query failed');
        }
    }

    if (newEmissions.length > 0) {
        try {
            const bulkOperations = newEmissions.map(emission => ({
                updateOne: {
                    filter: { datetime: emission.datetime },
                    update: { $set: { carbonEmission: emission.carbonEmission } },
                    upsert: true,
                },
            }));

            const result = await CarbonEmission.bulkWrite(bulkOperations);
            logger.info(`Stored ${newEmissions.length} fresh emission records in the database.`);
            return result;
        } catch (err) {
            logger.error('Error making bulk operations and performing bulkWrite:', { error: err.message });
            throw new Error('Bulk write operation failed');
        }
    } else {
        logger.info('No fresh emissions data to store.');
        return null;
    }
}

async function getDailyEmissionsFromDB(date) {
    logger.info('Starting to get daily emissions from database');

    const startOfDayDate = startOfDay(parseISO(date));
    const endOfDayDate = endOfDay(startOfDayDate);

    try {
        const emissions = await CarbonEmission.find({
            datetime: { $gte: startOfDayDate, $lte: endOfDayDate }
        }).sort({ datetime: 1 }).exec();

        const hourlyEmissions = [];
        for (let hour = 0; hour < 24; hour++) {
            const hourStart = startOfDayDate.setHours(hour, 0, 0, 0);
            const hourEnd = startOfDayDate.setHours(hour, 59, 59, 999);
            const emission = emissions.find(e => e.datetime >= hourStart && e.datetime <= hourEnd);
            hourlyEmissions.push(emission ? emission.carbonEmission : null);
        }

        return hourlyEmissions;
    } catch (error) {
        logger.error('Error fetching daily emissions from database:', { error: error.message });
        throw error;
    }
}

module.exports = {
    storeHourlyEmissions,
    getDailyEmissionsFromDB,
};
