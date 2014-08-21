/**
 * Created by filip on 8/19/14.
 */
var winston = require('winston');

var log_dir = '/var/log';

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: true, timestamp: true }),
        new winston.transports.File({ filename: log_dir + '/rabix-debug.log', json: false })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: true, timestamp: true }),
        new winston.transports.File({ filename: log_dir + '/rabix-exceptions.log', json: false })
    ],
    exitOnError: false
});

module.exports = logger;
