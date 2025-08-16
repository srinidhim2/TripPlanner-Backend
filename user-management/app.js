const express = require('express');
const morgan = require('morgan');
const { logger } = require('./logger/logger');
const userRouter = require('./routes/userRoutes');

const api = express.Router();

// Mount userRouter under /user
api.use('/user', userRouter);

module.exports = api;