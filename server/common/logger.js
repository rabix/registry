/**
 * Created by filip on 8/19/14.
 */
var winston = require('winston');

var log_dir = '/var/log/rabix';

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: true, timestamp: true }),
        new winston.transports.File({ filename: log_dir + '/debug.log', json: false })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: true, timestamp: true }),
        new winston.transports.File({ filename: log_dir + '/exceptions.log', json: false })
    ],
    exitOnError: false
});

module.exports = logger;
