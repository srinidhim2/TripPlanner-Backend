const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const blacklisttokenModel = require('../models/BlacklistedToken');
const userModel = require('../models/User');
const { logger } = require('../logger/logger');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token =  req.cookies.token || (authHeader && authHeader.split(' ')[1])
        // console.log('----------',token, '----------');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isBlacklisted = await blacklisttokenModel.find({ token });

        if (isBlacklisted.length) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        logger.debug(token);
        const cleanedToken = token.trim();
        const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);
        logger.debug('Decoded token:', decoded);

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = authMiddleware;
