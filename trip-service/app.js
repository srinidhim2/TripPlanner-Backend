const express = require('express');
const morgan = require('morgan');
const { logger } = require('./logger/logger');
const tripRouter = require('./routes/tripRouter');

const api = express.Router();

api.use('/',tripRouter);
// Mount userRouter under /user
module.exports = api;