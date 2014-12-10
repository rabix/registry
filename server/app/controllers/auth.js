'use strict';

var express = require('express');
var router = express.Router();
var config = require('../../config/config');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var https = require('https');

/**
 * Populate user object with appropriate info
 *
 * @param user
 * @returns {Object} gitHubObj
 */
var parseUser = function(user) {

    var gitHubObj = {
        id: user.id,
        github_id: user._json.id,
        name: user._json.name,
        repos_url: user._json.repos_url,
        url: user._json.url,
        gravatar_id: user._json.gravatar_id,
        avatar_url: user._json.avatar_url,
        login: user._json.login
    };

    return gitHubObj;

};

/**
 * Create new user or update the existing one with info from GitHub
 *
 * @param email
 * @param gitHubObj
 * @param profile
 * @returns {mongoose.Promise}
 */
var addUser = function(email, gitHubObj, profile) {

    var mongoose = require('mongoose');
    var promise = new mongoose.Promise();
    var User = mongoose.model('User');

    User.count({email: email}, function(err, count) {

        if (count === 0) {
            var user = new User();

            user.username = profile.username;
            user.email = email;
            user.github = gitHubObj;

            user.save();

            promise.fulfill({id: user._id});
        } else {

            User.findOneAndUpdate({email: email}, {github: gitHubObj}, {}, function(err, user, done) {
                if (err) { return done(null, null); }
                promise.fulfill({id: user._id});
            });
        }
    });

    return promise;

};

module.exports = function (app) {

    app.use('/auth', router);

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

                var gitHubObj = parseUser(profile);
                gitHubObj.accessToken = accessToken;

                console.log('User',email, profile);

                if (!email) {
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
                            console.log('GOT EMAIL: ', e);
                            profile.emails = [{value: e[0].email}];

                            addUser(e[0].email, gitHubObj, profile).then(function(user) {
                                profile.id = user.id;
                                return done(null, profile);
                            });

                        });

                    }).on('error', function (e) {
                        console.log('error while getting user email', e);
                    });
                } else {
                    addUser(email, gitHubObj, profile).then(function(user) {
                        profile.id = user.id;
                        return done(null, profile);
                    });
                }


            });
        }
    ));

};

/**
 * Login middle handler (direct output of /auth/github is too ugly!)
 *
 * @apiName Login
 * @api {GET} /api/login
 * @apiGroup Auth
 */
router.get('/login',
    function (req, res, next) {
        return next();
    },
    function (req, res) {
        res.redirect('/auth/github');
    });

/**
 * GitHub handler which initiate GitHub login
 *
 */
router.get('/github',
    passport.authenticate('github'),
    function () { /* will never be called */ });

/**
 * GitHub callback after successfull authentication
 */
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    });

/**
 * Logout user and redirect to home
 *
 * @apiName Logout
 * @api {GET} /api/logout
 * @apiGroup Auth
 */
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

/**
 * Don't know what is this
 * TODO: delete if not used
 */
router.get('/get-access-token', function (req, res) {
    res.json(req.query);
});







