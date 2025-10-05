const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const blacklisttokenModel = require('../models/BlacklistedToken');
const userModel = require('../models/User');
const { logger } = require('../logger/logger');
const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379'); // Init Redis client

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || (authHeader && authHeader.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await blacklisttokenModel.find({ token });
    if (isBlacklisted.length) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    logger.debug(token);
    const cleanedToken = token.trim();
    const decoded = await jwt.verify(cleanedToken, JWT_SECRET);
    logger.debug('Decoded token:', decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = decoded.id;
    const cacheKey = `user:${userId}`;

    // Check Redis cache first
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      logger.info(`User ${userId} retrieved from Redis cache`);
      req.user = JSON.parse(cachedUser);
      return next();
    }

    // Cache miss, fetch from DB
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Cache the user data in Redis (update TTL as needed)
    await redis.set(cacheKey, JSON.stringify(user), 'EX', 600); // Cache for 10 minutes

    req.user = user;
    logger.debug('Authenticated user:', user._id);
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = authMiddleware;
