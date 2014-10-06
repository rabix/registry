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

module.exports = function (app, config) {
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'ejs');

    // app.use(favicon(config.root + '/public/img/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());

    app.use('/', express.static(config.root + config.clientPath));
    app.use('/cliche', express.static(config.root + config.clichePath));
    app.use('/pipeline-editor', express.static(config.root + config.pipelineEditorPath));

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

    if (app.get('env') === 'development') {
        app.use(function (err, req, res) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err,
                title: 'error'
            });
        });
    }

    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {},
            title: 'error'
        });
    });


};
