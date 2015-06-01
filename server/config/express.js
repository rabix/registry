'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var passport = require('passport');
var session = require('express-session');

var winston = require('../common/logger');
var clientPath = '';
var rbxPath = '';

module.exports = function (app, config) {

    clientPath = config.clientPath;
    rbxPath = config.rbxPath;

    if (config.clientPath.charAt(0) !== '/') {
        clientPath = config.root + config.clientPath;
    }

    app.set('views', config.root + '/app/views');
    app.set('view engine', 'ejs');

    app.use(favicon(clientPath + '/images/favicon.ico'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());

    app.use('/', express.static(clientPath));
    app.use('/rbx', express.static(config.root + '/static'));
    app.use('/docs', express.static(config.root + '/docs'));

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    /**
     * Stream logs through winston logger
     */
    app.use(logger({
        format: 'dev',
        'stream': {
            write: function(str) {
                winston.info(str);
            }
        }
    }));

    app.use(methodOverride());

    app.use(session({
        secret: 'reallybigsecret',
        saveUninitialized: true,
        resave: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());


    var controllersPath = path.join(__dirname, '../app/controllers');
    fs.readdirSync(controllersPath).forEach(function (file) {
        if (file.indexOf('.js') >= 0) {
            require(controllersPath + '/' + file)(app);
        }
    });

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

//    if (app.get('env') === 'development') {
//        app.use(function (err, req, res) {
//            res.status(err.status || 500);
//            res.render('error', {
//                message: err.message,
//                error: err,
//                title: 'error'
//            });
//        });
//    }

    /**
     * All errors are intercepted here and formated
     */
    app.use(function (err, req, res, next) {
        console.error('Caught err: ',err);
        winston.error({route: req.url || req.originalRoute, status: err.status || 500,error: err.body, message: err.message || 'Request parse error'});
        res.status(err.status || 500).json({error: err.body, message: err.message || 'Request parse error'});
    });

};
