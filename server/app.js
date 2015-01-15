'use strict';

var express = require('express'),
    config = require('./config/config'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mongoOpts = {},
    dbPath = config.db;

// Check if we got db config as object and ssl config in server property
if (typeof config.db === 'object' && config.db.options) {

    mongoOpts = config.db.options;

    dbPath = config.db.path;
}

mongoose.connect(dbPath, mongoOpts);

var db = mongoose.connection;

db.on('error', function () {
    throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';

fs.readdirSync(modelsPath).forEach(function (file) {
    if (file.indexOf('.js') >= 0) {
        require(modelsPath + '/' + file);
    }
});

var app = express();

require('./config/express')(app, config);

app.listen(config.port, function () {
    console.log('App served on http://localhost:' + config.port);
});
