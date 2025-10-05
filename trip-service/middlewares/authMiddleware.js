const axios = require("axios");
const jwt = require("jsonwebtoken");
const { logger } = require("../logger/logger");
const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379'); // Init Redis client

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn("No authorization header provided");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      logger.warn("Token missing in authorization header");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.decode(token);
      logger.debug("Decoded JWT token:", decoded);
    } catch (err) {
      logger.error("Invalid JWT token", { error: err.message });
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (!decoded?.id) {
      logger.warn("Token does not contain user id");
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = decoded.id;

    // Try to get user from Redis cache first
    const cacheKey = `user:${userId}`;
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      logger.info(`User ${userId} retrieved from Redis cache`);
      req.user = JSON.parse(cachedUser);
      req.userId = userId;
      return next();
    }

    // Redis cache miss, fetch from user-service
    if (!process.env.USER_SERVICE_URL) {
      logger.error("USER_SERVICE_URL is not defined");
      return res.status(500).json({ success: false, message: "Service configuration error" });
    }

    const url = `${process.env.USER_SERVICE_URL}/user/${userId}`;
    logger.info(`Verifying user from user-service`, { userId });

    let user;
    try {
      user = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!user?.data) {
        logger.warn(`User not found in user-service: ${userId}`);
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

    } catch (axiosError) {
      logger.error("Error fetching user from user-service", {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Cache user data in Redis (expires in 600 seconds = 10 minutes)
    await redis.set(cacheKey, JSON.stringify(user.data), "EX", 600);

    req.user = user.data;
    req.userId = userId;

    logger.info(`User verified: ${userId}`);
    next();

  } catch (error) {
    logger.error("Error in authMiddleware", { error: error.message });
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
