
var winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
require('dotenv').config();

const LOG_LEVEL = process.env.LOG_LEVEL;
const transport = new winston.transports.DailyRotateFile({
    filename: 'logfile_%DATE%_bkp.log',
    dirname: path.join(__dirname, '../logs'), // optional, change as needed
    datePattern: 'YYYY-MM-DD',         // daily rotation
    zippedArchive: false,                 // true if you want zipped logs
    maxSize: '20m',                       // optional max size per log
    maxFiles: '14d',                      // keep for 14 days
    level: LOG_LEVEL,                       // ensure debug logs are captured
    createSymlink: true,                  // creates 'logfile.log' symlink to latest
    symlinkName: 'logfile.log'            // name of symlinked current file
});
const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.errors({ stack: true }), // Capture error name + stack trace
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack, name }) => {
            // If error object is logged, include name/stack
            if (stack) {
                return `${timestamp} [${level.toUpperCase()}]: ${name || 'Error'}: ${message}\n${stack}`;
            }
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [transport]
});

logger.stream = {
    write: (message) => {
        // Remove newline Morgan adds and log as info
        logger.info(message.trim());
    }
};

// winston.error("Some message");
module.exports = { logger };
