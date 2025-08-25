const axios = require("axios");
const jwt = require("jsonwebtoken");
const { logger } = require("../logger/logger");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.warn("⚠️ No authorization header provided");
      logger.warn("No authorization header provided");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn("⚠️ Token missing in authorization header");
      logger.warn("Token missing in authorization header");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Decode token (without verifying here since user-service handles validation)
    let decoded;
    try {
      decoded = jwt.decode(token);
      logger.debug("Decoded JWT token:", decoded);
    } catch (err) {
      console.error("❌ Invalid JWT token");
      logger.error("Invalid JWT token", { error: err.message });
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (!decoded?.id) {
      console.warn("⚠️ Token does not contain user id");
      logger.warn("Token does not contain user id");
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Verify user exists in user-service
    console.log('URL:', process.env.USER_SERVICE_URL);
    if (!process.env.USER_SERVICE_URL) {
      console.error("❌ USER_SERVICE_URL is not defined in environment variables");
      logger.error("USER_SERVICE_URL is not defined");
      return res.status(500).json({ success: false, message: "Service configuration error" });
    }
    const url = `${process.env.USER_SERVICE_URL}/user/${decoded.id}`;
    console.log(`🔍 Verifying user from user-service: ${url}`);
    logger.info(`Verifying user from user-service`, { userId: decoded.id });
    logger.debug('token:', token);
    let user;
    try {
      user = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!user?.data) {
        logger.warn(`User not found in user-service: ${decoded.id}`);
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
  
    } catch (axiosError) {
      // Log error response details if available
      logger.error("Error fetching user from user-service", {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = user.data
    console.log('User from user-service:', user.data);
    console.log(req.user);
    // Attach userId to request for downstream usage
    req.userId = decoded.id;

    console.log(`✅ User verified: ${decoded.id}`);
    logger.info(`User verified`, { userId: decoded.id });

    next();
  } catch (error) {
    console.error("❌ Error in authMiddleware:", error.message);
    logger.error("Error in authMiddleware", { error: error.message });
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
