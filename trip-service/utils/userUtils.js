const axios = require('axios');
const { logger } = require('../logger/logger');

async function verifyUserExists(userId, token) {
  if (!process.env.USER_SERVICE_URL) {
    throw new Error('USER_SERVICE_URL environment variable is not configured');
  }
  const url = `${process.env.USER_SERVICE_URL}/user/${userId}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data) {
      throw new Error(`User with id ${userId} not found`);
    }
    return true; // user exists
  } catch (err) {
    logger.error(`Failed to verify user ${userId}`, {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    throw new Error(`User with id ${userId} not found`);
  }
}
module.exports = { verifyUserExists };