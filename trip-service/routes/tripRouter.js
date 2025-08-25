const { createTripController, editTripController } = require('../controllers/tripController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const tripRouter = express.Router();
tripRouter.post('/createTrip', authMiddleware, createTripController);
tripRouter.patch('/updateTrip/:id', authMiddleware, editTripController);
module.exports = tripRouter;