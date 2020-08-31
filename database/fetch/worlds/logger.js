//@ts-check
const path = require('path');
const { createLogger, format, transports, level} = require('winston');
const { combine, printf, timestamp, label } = format;

const logger = createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      format.json(),
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({ filename: path.join('logs','error.log'), level: 'error' }),
      new transports.File({ filename: path.join('logs','combined.log') })
    ]
  });
  const myFormat = printf(({ level, message, timestamp }) => {
    return `[${level.toUpperCase()}] ${timestamp} : ${message}`;
  });
  logger.add(new transports.Console({
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      myFormat
    )
  }));

module.exports={ logger };