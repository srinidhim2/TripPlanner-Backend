const User = require('../models/User');
const Joi = require('joi');
const { logger } = require('../logger/logger');

const userSchema = Joi.object({
    name: Joi.string().trim().required(),
    dateOfBirth: Joi.date().required(),
    email: Joi.string().email().trim().lowercase().required(),
    phone: Joi.string().trim().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    profilePhoto: Joi.string().optional()
});

exports.createUserController = async (req, res) => {
    logger.debug('Received request to create user: ' + JSON.stringify(req.body));
    // Validate request body
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        logger.info('User validation failed: ' + error.details[0].message);
        logger.debug('Validation error details: ' + JSON.stringify(error.details));
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        logger.debug('Checking if user already exists for email: ' + value.email);
        // Check if user already exists
        const existingUser = await User.isExist(value.email);
        if (existingUser) {
            logger.info('User already exists: ' + value.email);
            logger.debug('Existing user found: ' + JSON.stringify(existingUser));
            return res.status(409).json({ error: 'User already exists' });
        }
        logger.debug('No existing user found, proceeding to create user.');
        // Create new user
        const user = new User(value);
        await user.save();
        logger.info('User created: ' + user.email);
        logger.debug('Created user details: ' + JSON.stringify(user));
        res.status(201).json(user);
    } catch (err) {
        logger.error('Error creating user:', err);
        logger.debug('Error stack: ' + err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
};
