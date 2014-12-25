/**
 * Created by filip on 8/19/14.
 */

'use strict';

var winston = require('winston');
var path = require('path');
var config = require('../config/config');

var logPath = path.normalize(config.logging.path);

var debugLog = logPath + '/rabix-debug.log';
var exceptionLog = logPath + '/rabix-exceptions.log';

var timeFormatFn = function() {
    return Date.now();
};

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: debugLog,
            dirname: config.logging.path,
            timestamp: timeFormatFn
        }),
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: debugLog, json: false })
    ],
    exceptionHandlers: [
        new(winston.transports.DailyRotateFile)({
            filename: exceptionLog,
            dirname: config.logging.path,
            timestamp: timeFormatFn
        }),
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: exceptionLog, json: false })
    ],
    exitOnError: false
});

module.exports = logger;
