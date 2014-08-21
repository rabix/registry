/**
 * Created by filip on 8/19/14.
 */
var winston = require('winston');
var path = require('path');
var config = require('../config/config');

var logPath = path.normalize(config.logging.path);

var debugLog = logPath + '/rabix-debug.log';
var exceptionLog = logPath + '/rabix-exceptions.log';

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: true, timestamp: true }),
        new winston.transports.File({ filename: debugLog, json: false })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: true, timestamp: true }),
        new winston.transports.File({ filename: exceptionLog, json: false })
    ],
    exitOnError: false
});

module.exports = logger;
