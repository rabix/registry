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
var GitHubStrategy = require('passport-github').Strategy;
var session = require('express-session');

var https = require('https');

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
    app.use(express.static(config.root + config.clientPath));
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

    var parseUser = function(user) {

        var gitHubObj = {
            id: user._json.id,
            name: user._json.name,
            repos_url: user._json.repos_url,
            url: user._json.url,
            gravatar_id: user._json.gravatar_id,
            avatar_url: user._json.avatar_url,
            login: user._json.login
        };

        return gitHubObj;

    };

    passport.serializeUser(function(profile, done) {
        var user = parseUser(profile);
        user.email = profile.emails[0].value;
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(new GitHubStrategy({
            clientID: config.github.clientId,
            clientSecret: config.github.clientSecret,
            callbackURL: config.github.callbackURL,
            scope: config.github.scope
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {

                var email = profile.emails[0].value;

//                var gitHubObj = {
//                    id: profile._json.id,
//                    name: profile._json.name,
//                    repos_url: profile._json.repos_url,
//                    url: profile._json.url,
//                    gravatar_id: profile._json.gravatar_id,
//                    avatar_url: profile._json.avatar_url,
//                    login: profile._json.login,
//                    accessToken: accessToken
//                };
                var gitHubObj = parseUser(profile);
                gitHubObj.accessToken = accessToken;

                if (typeof email === 'undefined') {
                    var opts = {
                        hostname: 'api.github.com',
                        path: '/user/emails',
                        headers: {
                            'Authorization': 'token ' + accessToken,
                            'User-Agent': 'Rabix',
                            'Content-type': 'application/json'
                        }
                    };

                    https.get(opts, function (response) {
                        var responseString = '';

                        response.setEncoding('utf8');

                        response.on('data', function (data) {
                            responseString += data;
                        });

                        response.on('end', function () {
                            var e = JSON.parse(responseString);
                            profile.emails = [
                                {
                                    value: e[0].email
                                }
                            ];
                            addUser(e[0].email, gitHubObj, profile);

                            return done(null, profile);
                        });

                    }).on('error', function (e) {
                        console.log('error while getting user email', e);
                    });
                } else {
                    addUser(email, gitHubObj, profile);

                    return done(null, profile);
                }


            });
        }
    ));

    function addUser(email, gitHubObj, profile) {
        var mongoose = require('mongoose');
        var User = mongoose.model('User');

        User.count({email: email}, function(err, count) {
            console.log(count);
            if (count === 0) {
                var user = new User();

                user.username = profile.username;
                user.email = email;
                user.github = gitHubObj;

                user.save();
            } else {
                console.log(profile);
                User.findOneAndUpdate({email: email}, {github: gitHubObj}, {}, function() {
                    if (err) { return done(null, null); }

                });
            }

        });

    }

};
