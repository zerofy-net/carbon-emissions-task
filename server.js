const express = require('express');
const cronJob = require('node-cron');

const connectDB = require('./config/db');
const logger = require('./logs/logger');
const carbonRoutes = require('./modules/carbon-emissions/routes');
const errorHandler = require('./middleware/errorHandler');
const { updateCarbonEmissions } = require('./modules/carbon-emissions/controller');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', carbonRoutes);
app.use(errorHandler);

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to connect to MongoDB', { error: err.message });
        process.exit(1);
    }
}


startServer();

cronJob.schedule('0 * * * *', async () => {
    try {
        await updateCarbonEmissions();
        logger.info('Scheduled update of carbon emissions completed successfully.');
    } catch (err) {
        logger.error('Error during scheduled update of carbon emissions', { error: err.message });
    }
});


// exports.api = async (req, res) => {
//     try {
//         await connectDB();
//         app(req, res);
//     } catch (error) {
//         logger.error('Failed to connect to MongoDB', { error: error.message });
//         res.status(500).send('Internal Server Error');
//     }
// };

// exports.scheduledUpdateCarbonEmissions = async (event, context) => {
//     try {
//         await connectDB();
//         await updateCarbonEmissions();
//         logger.info('Scheduled update of carbon emissions completed successfully.');
//     } catch (error) {
//         logger.error('Error during scheduled update of carbon emissions', { error: error.message });
//     }
// };
