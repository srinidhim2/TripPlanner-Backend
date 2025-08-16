
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
        logger.info('Connected to MongoDB (user database)');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
