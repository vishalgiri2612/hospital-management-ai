const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  const logDir = process.env.LOG_FILE
    ? path.dirname(process.env.LOG_FILE)
    : 'logs';
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: process.env.LOG_FILE || 'logs/app.log',
    })
  );
}

module.exports = logger;
