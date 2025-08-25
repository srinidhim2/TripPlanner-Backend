const { logger } = require('../logger/logger');
process.on('uncaughtException', (err) => {
    console.log("uncaughtException");
    logger.error(err.message, err);
})
process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection');
})


function handleErrors(err, req, res, next) {
    try {
        if (res.statusCode == 200) {
            logger.error(err.message, err);
            res.status(err.statusCode || 500);
        }
        res.json({ error: err.message || "something went wrong" });
    } catch (err) {
        next();
    }
}

module.exports = handleErrors;