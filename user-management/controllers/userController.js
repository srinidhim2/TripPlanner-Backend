const BlacklistedToken = require('../models/BlacklistedToken');
const { sendKafkaMessage } = require('../utils/kafkaProducer');
const User = require('../models/User');
const Joi = require('joi');
const { logger } = require('../logger/logger');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const FriendRequest = require('../models/FriendRequest');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const FRIEND_REQUEST_TOPIC = process.env.FRIEND_REQUEST_TOPIC

const userSchema = Joi.object({
    name: Joi.string().trim().required(),
    dateOfBirth: Joi.date().required(),
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(6).max(128).required(),
    phone: Joi.string().trim().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    profilePhoto: Joi.string().optional()
});
const allowedFields = ['name', 'dateOfBirth', 'phone', 'gender', 'profilePhoto'];

exports.updateUserController = async (req, res) => {
    try {
        const userId = req.user._id; // Auth middleware attaches user to req.user
        const updates = {};

        // Build updates object based on payload and allowed fields
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // (Optional) Validate the updates here with Joi before saving

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createUserController = async (req, res) => {
    logger.debug('Received request to create user: ' + JSON.stringify(req.body));
    // Validate request body
    const result = userSchema.validate(req.body);
    logger.debug('Validation result: ' + JSON.stringify(result));
    if (result.error) {
        logger.info('User validation failed: ' + result.error.details[0].message);
        logger.debug('Validation error details: ' + JSON.stringify(result.error.details));
        return res.status(400).json({ error: result.error.details[0].message });
    }
    // Use result.value directly

    try {
        logger.debug('Checking if user already exists for email: ' + result.value.email);
        // Check if user already exists
        const existingUser = await User.isExist(result.value.email);
        if (existingUser) {
            logger.info('User already exists: ' + result.value.email);
            logger.debug('Existing user found: ' + JSON.stringify(existingUser));
            return res.status(409).json({ error: 'User already exists' });
        }
        logger.debug('No existing user found, proceeding to create user.');

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(result.value.password, 10);
        const user = new User({
            ...result.value,
            password: hashedPassword
        });
        await user.save();
        logger.info('User created successfully: ' + user.email);
        logger.debug('Created user details: ' + JSON.stringify(user));
        res.status(201).json({
            message: 'User created successfully',
            user: {
                _id: user._id,
                name: user.name,
                dateOfBirth: user.dateOfBirth,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (err) {
        logger.error('Error creating user:', err);
        logger.debug('Error stack: ' + err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.uploadProfilePhotoController = async (req, res) => {
    const userId = req.params.id;
    try {
        if (!req.file) {
            logger.info('No profile photo uploaded');
            return res.status(400).json({ error: 'No profile photo uploaded' });
        }
        const photoFilename = req.file.filename;
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePhoto: photoFilename },
            { new: true }
        );
        if (!user) {
            logger.info('User not found for profile photo upload: ' + userId);
            return res.status(404).json({ error: 'User not found' });
        }
        logger.info('Profile photo uploaded for user: ' + user.email);
        res.status(201).json({ message: 'Profile photo uploaded', user });
    } catch (err) {
        logger.error('Error uploading profile photo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserController = async (req, res) => {
    // Validate user ID param
    const idSchema = Joi.string().length(24).hex().required();
    const { error } = idSchema.validate(req.params.id);
    if (error) {
        logger.info('Invalid user ID: ' + req.params.id);
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            logger.info('User not found: ' + req.params.id);
            return res.status(404).json({ error: 'User not found' });
        }
        logger.info('User fetched: ' + user.email);
        res.status(200).json(user);
    } catch (err) {
        logger.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProfilePhotoController = async (req, res) => {
    const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads/profilephoto');
    // Validate user ID param
    const idSchema = Joi.string().length(24).hex().required();
    const { error } = idSchema.validate(req.params.id);
    if (error) {
        logger.info('Invalid user ID for profile photo: ' + req.params.id);
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.profilePhoto) {
            logger.info('Profile photo not found for user: ' + req.params.id);
            return res.status(404).json({ error: 'Profile photo not found' });
        }
        const photoPath = path.resolve(uploadsDir, user.profilePhoto);
        logger.debug('Profile photo path: ' + photoPath);
        if (!fs.existsSync(photoPath)) {
            logger.info('Profile photo file missing: ' + photoPath);
            return res.status(404).json({ error: 'Profile photo file not found' });
        }
        res.sendFile(photoPath);
    } catch (err) {
        logger.error('Error fetching profile photo:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.loginController = async (req, res) => {
     try {
        const { email, password } = req.body;
        const user = await User
            .findOne({ email })
            .select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        delete user._doc.password;
        res.cookie('token', token);
        res.send({ token });
    } catch (error) {
        next(error)
    }
};

exports.logoutController = async (req, res) => {
    let token = null;
    if (req.cookies && req.cookies.token) {
        console.log('Token found in cookies');
        logger.debug('Token found in cookies');
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(400).json({ error: 'No token provided for logout' });
    }
    try {
        // Decode token to get expiry
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        const expiresAt = new Date(decoded.exp * 1000);
        await BlacklistedToken.create({ token, expiresAt });
        res.clearCookie('token');
        logger.info('Logout successful, token blacklisted');
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        logger.error('Error during logout:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

