
// Core modules and configuration
const express = require('express');
const app = express();
const morgan = require('morgan');
const { logger } = require('./logger/logger');
const connectDB = require('./config/db/db');
const api = require('./app');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const handleErrors = require('./middlewares/error-handler');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form-data
app.use('/',api)
// Logging and startup  
logger.info('Starting Trip Service...');
logger.debug('Attempting to connect to MongoDB...');
connectDB();
app.listen(process.env.TRIP_SERVER_PORT, () => {
    logger.info(`Trip Service listening on port ${process.env.TRIP_SERVER_PORT}`);
    console.log('Trip Service listening on port ' + process.env.TRIP_SERVER_PORT);
});

app.use(handleErrors); // Error handling middleware
logger.debug('Error handling middleware registered');