
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

// Logging and startup
logger.info('Starting User Management Server...');
logger.debug('Attempting to connect to MongoDB...');
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form-data
logger.debug('Express JSON and URL-encoded middleware enabled');

// HTTP request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => {
            logger.info(message.trim()); // log to file
            process.stdout.write(message); // also print to console
        }
    }
}));
logger.debug('Morgan HTTP logger enabled (file and console)');

// API routes
app.use('/', api); // Use the API router defined in app.js
logger.debug('API routes mounted');

// Server port
const PORT = process.env.USER_SERVER_PORT || 3000;
logger.debug(`Server port set to ${PORT}`);

// Health check route
app.get('/', (req, res) => {
    res.send('User Management Server is running');
});

app.use(handleErrors); // Error handling middleware
logger.debug('Error handling middleware registered');
// Start server
app.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
});
