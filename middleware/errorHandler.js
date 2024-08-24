const logger = require('../logs/logger')

function errorHandler(err, req, res, next) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: err.message });
}

module.exports = errorHandler;
