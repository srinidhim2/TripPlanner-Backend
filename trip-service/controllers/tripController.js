const Joi = require('joi');
const axios = require('axios');
const Trip = require('../models/Trip');
const HttpError = require('../utils/httpError');
const { logger } = require('../logger/logger');
const { sendKafkaMessage } = require('../utils/kafkaProducer');
require('dotenv').config();
const { verifyUserExists } = require('../utils/userUtils');

const TRIP_PLANNER_TOPIC = process.env.TRIP_PLANNER_TOPIC || 'trip-planner';

const tripSchema = Joi.object({
  name: Joi.string().trim().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  schedules: Joi.object().pattern(
    Joi.string(),
    Joi.string().isoDate()
  ).optional(),
  places: Joi.array().items(Joi.string().trim()).optional(),
  peoples: Joi.array().items(
    Joi.object({
      userId: Joi.string().length(24).hex().required(),
      role: Joi.string().valid('organizer', 'member', 'guest').required(),
      status: Joi.string().valid('accept', 'decline', 'tentative').optional().default('tentative'),
    })
  ).optional()
});

exports.createTripController = async (req, res, next) => {
  try {
    const { error, value } = tripSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      logger.error(`Validation error: ${message}`);
      throw new HttpError(`Validation error: ${message}`, 400);
    }

    const { name, startDate, endDate, schedules, places, peoples } = value;
    const createdBy = req.user._id;
    logger.info(`Creating trip for user ${createdBy}`);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const trip = new Trip({
      name,
      startDate: start,
      endDate: end,
      schedules,
      places,
      createdBy,
      peoples: peoples || []
    });
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if (peoples && peoples.length > 0) {
      for (const p of peoples) {
        const people = await verifyUserExists(p.userId, token);
        if (!people) {
          logger.warn(`User in peoples not found: ${p.userId}`);
          throw new HttpError(`User with id ${p.userId} not found`, 404);
        }
      }
    }
    trip.peoples.push({ userId: createdBy, role: 'admin', status: 'tentative' });

    logger.debug(`Saving trip document: ${JSON.stringify(trip)}`);

    const tripDoc = await trip.save();
    if (!tripDoc) {
      throw new HttpError('Trip creation failed', 500);
    }
    logger.info(`Trip saved with ID: ${tripDoc._id}`);
    console.log('Trip saved with ID:', tripDoc._id);

    console.log('TOPIC:', TRIP_PLANNER_TOPIC);
    await sendKafkaMessage(TRIP_PLANNER_TOPIC, {
      category: 'trip-planner',
      event: 'create-trip',
      trip
    });

    logger.info(`Trip created successfully: ${trip._id} by user ${createdBy}`);
    console.log(`Trip created: ${trip._id}`);

    res.status(201).json({ message: "Trip created successfully", trip });
  } catch (err) {
    logger.error('Error creating trip', err);
    console.error('Trip creation error:', err);
    next(err);  // Pass error to centralized error handler middleware
  }
};


const tripUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
  schedules: Joi.object().pattern(
    Joi.string(),
    Joi.string().isoDate()
  ).optional(),
  places: Joi.array().items(Joi.string().trim()).optional(),
  peoples: Joi.array().items(
    Joi.object({
      userId: Joi.string().length(24).hex().required(),
      role: Joi.string().valid('admin', 'member', 'guest').required(),
      status: Joi.string().valid('accept', 'decline', 'tentative').optional().default('tentative'),
    })
  ).optional()
}).min(1);  // Require at least one field to update

exports.editTripController = async (req, res, next) => {
  try {
    // Validate trip ID param
    const tripId = req.params.id;
    if (!tripId || tripId.length !== 24) {
      logger.warn('Invalid or missing trip ID in request params');
      throw new HttpError('Invalid trip ID', 400);
    }

    // Validate request body fields
    const { error, value } = tripUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      logger.error(`Validation error on trip update: ${message}`);
      throw new HttpError(`Validation error: ${message}`, 400);
    }

    const { name, startDate, endDate, schedules, places, peoples } = value;
    const userId = req.user._id;
    logger.info(`User ${userId} requests to update trip ${tripId}`);

    // Fetch the existing trip document to update
    const trip = await Trip.findById(tripId);
    if (!trip) {
      logger.warn(`Trip not found with id: ${tripId}`);
      throw new HttpError('Trip not found', 404);
    }

    // Optionally verify user is authorized to edit trip (e.g., createdBy matches userId)
    if (trip.createdBy.toString() !== userId.toString()) {
      logger.warn(`User ${userId} unauthorized to edit trip ${tripId}`);
      throw new HttpError('Unauthorized to modify this trip', 403);
    }

    // Verify users in peoples array (if provided)
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if (peoples && peoples.length > 0) {
      for (const p of peoples) {
        const userExists = await verifyUserExists(p.userId, token);
        if (!userExists) {
          logger.warn(`User in peoples not found: ${p.userId}`);
          throw new HttpError(`User with id ${p.userId} not found`, 404);
        }
      }
    }

    // Update only provided fields
    if (name !== undefined) trip.name = name;
    if (startDate !== undefined) trip.startDate = new Date(startDate);
    if (endDate !== undefined) trip.endDate = new Date(endDate);
    if (schedules !== undefined) trip.schedules = schedules;
    if (places !== undefined) trip.places = places;
    if (peoples !== undefined) trip.peoples = peoples;

    logger.debug(`Saving updated trip: ${tripId}`);

    const updatedTrip = await trip.save();
    if (!updatedTrip) {
      throw new HttpError('Failed to update trip', 500);
    }

    logger.info(`Trip ${tripId} updated successfully by user ${userId}`);
    console.log(`Trip updated: ${tripId}`);

    // Notify via Kafka about this update
    await sendKafkaMessage(TRIP_PLANNER_TOPIC, {
      category: 'trip-planner',
      event: 'update',
      trip: updatedTrip
    });

    res.status(200).json({ message: "Trip updated successfully", trip: updatedTrip });
  } catch (err) {
    logger.error('Error updating trip', err);
    console.error('Trip update error:', err);
    next(err);
  }
};

exports.getMyCreatedTripsController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    logger.info(`Fetching trips created by user: ${userId}`);

    const trips = await Trip.find({ createdBy: userId });
    logger.debug(`Found ${trips.length} trip(s) created by ${userId}`);

    res.status(200).json({ trips });
  } catch (err) {
    logger.error('Error retrieving user-created trips', err);
    next(err);
  }
};

exports.getMyParticipatingTripsController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    logger.info(`Fetching trips where user is a participant: ${userId}`);

    const trips = await Trip.find({ 'peoples.userId': userId });
    logger.debug(`Found ${trips.length} trip(s) where ${userId} is a participant`);

    res.status(200).json({ trips });
  } catch (err) {
    logger.error('Error retrieving trips user participates in', err);
    next(err);
  }
};



exports.getTripByIdController = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const userId = req.user._id;

    logger.info(`Fetching trip by id: ${tripId} for user: ${userId}`);

    // Validate trip ID format
    if (!tripId || tripId.length !== 24) {
      logger.warn(`Invalid or missing trip ID in request params: ${tripId}`);
      throw new HttpError('Invalid trip ID format', 400);
    }

    // Find the trip where user is creator or participant
    const trip = await Trip.findOne({
      _id: tripId,
      $or: [
        { createdBy: userId },
        { 'peoples.userId': userId }
      ]
    });

    if (!trip) {
      logger.warn(`Trip not found or user ${userId} not authorized to access: ${tripId}`);
      throw new HttpError('Trip not found or unauthorized', 404);
    }

    logger.debug(`Trip found: ${JSON.stringify(trip)}`);
    res.status(200).json({ trip });
  } catch (err) {
    logger.error('Error retrieving trip by id', err);
    next(err);
  }
};
