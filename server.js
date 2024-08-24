const express = require('express');
const connectDB = require('./config/db');
const logger = require('./logs/logger');
const carbonRoutes = require('./modules/carbon-emissions/routes');
const errorHandler = require('./middleware/errorHandler')
const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();
        app.use(express.json());
        app.use('/api', carbonRoutes);

        app.use(errorHandler);

        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`, {label: 'server.js'});
        });
    } catch (err) {
        logger.error('Failed to connect to MongoDB', { error: err.message });
        process.exit(1);
    }
})();
