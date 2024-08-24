const mongoose = require('mongoose');
const logger = require('../logs/logger');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function connectDB() {
    try {
        await mongoose.connect(uri);
        logger.info('MongoDB connected successfully with Mongoose');
    } catch (error) {
        logger.error('MongoDB connection failed:', { error: error.message });
        process.exit(1);
    }
}

module.exports = connectDB;
