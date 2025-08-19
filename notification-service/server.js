const express = require('express');
const morgan = require('morgan');
const { logger } = require('./logger/logger');
const app = express();
const connectDB = require('./config/db/db');
require('dotenv').config();
require('./controller/kafkaController') // Import Kafka controller for handling Kafka messages
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form-data
app.use(morgan('combined', {
    stream: {
        write: (message) => {
            logger.info(message.trim()); // log to file
            process.stdout.write(message); // also print to console
        }
    }
}));
app.listen(process.env.NOTIFICATION_SERVER_PORT || 3004, () => {
    logger.info(`Notification Service is listening on port ${process.env.NOTIFICATION_SERVER_PORT || 3004}`);
    console.log(`Notification Service is listening on port ${process.env.NOTIFICATION_SERVER_PORT || 3004}`);
});
// Connect to MongoDB
logger.info('Starting Notification Service Server...');
logger.debug('Attempting to connect to MongoDB...');
connectDB();





