const { createTripController, editTripController, getTripByIdController, getMyCreatedTripsController, getMyParticipatingTripsController } = require('../controllers/tripController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const tripRouter = express.Router();
tripRouter.post('/createTrip', authMiddleware, createTripController);
tripRouter.get('/getTrip/createByMe', authMiddleware, getMyCreatedTripsController)
tripRouter.get('/getTrip/all', authMiddleware, getMyParticipatingTripsController)

tripRouter.get('/getTrip/:id',authMiddleware, getTripByIdController)
tripRouter.patch('/updateTrip/:id', authMiddleware, editTripController);
module.exports = tripRouter;