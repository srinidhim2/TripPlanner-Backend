const User = require('../models/User');
const Joi = require('joi');
const { logger } = require('../logger/logger');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const userSchema = Joi.object({
    name: Joi.string().trim().required(),
    dateOfBirth: Joi.date().required(),
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(6).max(128).required(),
    phone: Joi.string().trim().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    profilePhoto: Joi.string().optional()
});

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
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    // Password validation: length and type
    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
        return res.status(400).json({ error: 'Password must be between 6 and 128 characters.' });
    }
    try {
        logger.debug('Login attempt for email: ' + email);
        const user = await User.findOne({ email });
        if (!user) {
            logger.info('Login failed: user not found for email ' + email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        logger.debug('User found for login: ' + JSON.stringify(user));
        // Use bcrypt to compare password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            logger.info('Login failed: invalid password for email ' + email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        logger.info('Login successful for user: ' + email);
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
        res.status(201).json({ message: 'Login successful', token });
    } catch (err) {
        logger.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.userAuthMiddleware = (req, res, next) => {
    let token = null;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
