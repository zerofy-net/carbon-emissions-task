const logger = require('../../logs/logger');
const CarbonEmission = require('./model');

async function storeHourlyEmissions(emissions) {
    logger.info('Checking for new emissions');

    const newEmissions = []
    
    for(emission of emissions){
        try {
            const existingRecord = CarbonEmission.findOne({ datetime: emission.datetime });
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
}

module.exports = {
    storeHourlyEmissions,
    getDailyEmissionsFromDB,
};
