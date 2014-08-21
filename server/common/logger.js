/**
 * Created by filip on 8/19/14.
 */
var winston = require('winston');
var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

var debugLog = rootPath + '/logs/rabix-debug.log';
var exceptionLog = rootPath + '/logs/rabix-exceptions.log';

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
