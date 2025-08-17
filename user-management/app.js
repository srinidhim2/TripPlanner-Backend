const express = require('express');
const morgan = require('morgan');
const { logger } = require('./logger/logger');
const userRouter = require('./routes/userRoutes');
const friendRouter = require('./routes/friendRoutes');

const api = express.Router();

// Mount userRouter under /user
api.use('/user', userRouter);
api.use('/friend', friendRouter); // Mount friendRouter under /friends
module.exports = api;