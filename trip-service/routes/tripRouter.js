const {
	createTripController,
	editTripController,
	getTripByIdController,
	getMyCreatedTripsController,
	getMyParticipatingTripsController,
	addScheduleController,
	updateScheduleController,
	getAllSchedulesController,
	getScheduleByIdController
} = require('../controllers/tripController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const tripRouter = express.Router();
tripRouter.post('/createTrip', authMiddleware, createTripController);
tripRouter.get('/getTrip/createByMe', authMiddleware, getMyCreatedTripsController)
tripRouter.get('/getTrip/all', authMiddleware, getMyParticipatingTripsController)

tripRouter.get('/getTrip/:id',authMiddleware, getTripByIdController)
tripRouter.patch('/updateTrip/:id', authMiddleware, editTripController);
// Schedules APIs
tripRouter.post('/:id/schedules', authMiddleware, addScheduleController);
tripRouter.patch('/:id/schedules/:scheduleId', authMiddleware, updateScheduleController);
tripRouter.get('/:id/schedules', authMiddleware, getAllSchedulesController);
tripRouter.get('/:id/schedules/:scheduleId', authMiddleware, getScheduleByIdController);

module.exports = tripRouter;