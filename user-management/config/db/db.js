const mongoose = require('mongoose');
require('dotenv').config();
const { logger } = require('../../logger/logger');
const dbUrl = process.env.USER_DB_URL;

const connectDB = async () => {
    logger.debug('Connecting to MongoDB with URL: ' + dbUrl);
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'user',
        });
        // Green color for console log
        const green = '\x1b[32m';
        const reset = '\x1b[0m';
        console.log(green + 'Connected to MongoDB (user database)' + reset);
        logger.info('Connected to MongoDB (user database)');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
