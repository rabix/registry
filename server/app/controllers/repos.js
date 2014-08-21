'use strict';

var express = require('express');
var router = express.Router();
var https = require('https');
var _ = require('lodash');
var uuid = require('node-uuid');
var Q = require('q');

var config = require('../../config/config');

var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

var bodyParser = require('body-parser');

var filters = require('../../common/route-filters');

var logger = require('../../common/logger');

var R = {
    db: 0,
    client: null,

    startBuild: function (repo) {

    }

};

//var redis = require('redis');

module.exports = function (app) {
//    app.use(bodyParser.urlencoded({
//        extended: true
//    }));
//    app.use(bodyParser.json());

    app.use('/api', router);
};

router.get('/repos', function (req, res, next) {
    
    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;

    Repo.count(function (err, total) {
        if (err) {
            return next(err);
        }

        Repo.find({}).skip(skip).limit(limit).exec(function (err, repos) {
            if (err) {
                return next(err);
            }

            res.json({list: repos, total: total});
        });
    });

});

router.get('/repos/:id', function (req, res, next) {

    Repo.findById(req.params.id, function (err, repo) {
        if (err) {
            return next(err);
        }

        res.json({data: repo});
    });

});

router.post('/repos', function (req, res, next) {

    var name = req.param('name');
    var owner = req.param('owner');
    var currentUser = req.user.email;

    if (req.user.username !== owner) {
        res.statusCode = 403;
        res.json({message: 'You can only setup repos owned by you'});
    }

    Repo.count({name: name, owner: owner}, function (err, count) {
        if (err) {
            return next(err);
        }

        if (count === 0) {
            var repo = new Repo();
            repo.name = name;
            repo.owner = owner;
            repo.created_by = owner;
            repo.secret = uuid.v4();

            repo.save();

            res.json({repo: repo});

            addWebhook(owner, name, currentUser);

        } else {
            res.statusCode = 403;
            res.json({message: 'Repository is already added'});
        }

    });

});

router.get('/github-repos', filters.authenticated, function (req, res, next) {

    User.findOne({email: req.user.email}, function (err, user) {
        if (err) {
            return next(err);
        }

        var opts = {
            host: 'api.github.com',
            path: '/users/' + user.username + '/repos',
            method: 'GET',
            headers: { 'User-Agent': 'RegistryApp' }
        };

        var request = https.request(opts, function (response) {

            var data = '';

            response.setEncoding('utf8');

            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {

                var repos = JSON.parse(data);
                var promises = [];

                _.each(repos, function (repo) {
                    promises.push(getRepoRow(repo));
                });

                Q.all(promises)
                    .then(function (repos) {
                        res.json({list: repos});
                    });
            });
        });

        request.end();

    });

});

router.post('/github-webhook', function (req, res, next) {
    var repo = req.param('repository');
    var event_type = req.headers['x-github-event'];
    var github_delivery = req.headers['x-github-delivery'];

    if (event_type === 'push') {
//        R.startBuild(repo);
        logger.info('[commit-push]: "'+github_delivery+'". There goes push to a repo: ' + JSON.stringify(repo));
    } else {
        logger.info('[event]:"'+ event_type +'". There was activity on repo: ' + JSON.stringify(repo));

    }


});

var getRepoRow = function (repo) {

    var promise = new mongoose.Promise;
    var fullNameArr = repo.full_name.split('/');
    var name = fullNameArr[1];
    var owner = fullNameArr[0];

    Repo.count({name: name, owner: owner}, function (err, count) {

        if (err) {
            promise.reject('Couldn\'t get the repo ' + repo.full_name);
        }

        promise.fulfill({full_name: repo.full_name, html_url: repo.html_url, added: count > 0});

    });

    return promise;
};

var addWebhook = function (owner, r, currentUser) {

    User.findOne({ email: currentUser }, function (err, user) {

        if (err) {
            logger.info('User not found for user with email: ' + currentUser);
            return next(err);
        }

        var token = user.github.accessToken;

        // TODO: check for token

        var url = '/repos/' + owner + '/' + r + '/hooks';
        var opts = {
            host: 'api.github.com',
            path: url,
            method: 'POST',
            headers: {
                'Authorization': 'token ' + token,
                'User-Agent': 'Rabix',
                'Content-type': 'application/json'
            }
        };

//        var repo = {
//            name: 'web',
//            events: [
//                "push",
//                "pull_request"
//            ],
//            config: {
//                url: 'http://www.rabix.org/api/github-webhook',
//                content_type: 'json',
//                insecure_ssl: 1
//            },
//            active: true
//        };

        var repo = {
            "name": "web",
            "active": true,
            "events": [
                "push",
                "pull_request"
            ],
            "config": {
                "url": "http://www.rabix.org/api/github-webhook",
                "content_type": "json"
            }
        };


        logger.info('Added repo "' + r + '", hooking up GITHUB webhook on to url: ' + url);

        var repoString = JSON.stringify(repo);

        var request = https.request(opts, function (response) {
            var responseString = '';

            response.setEncoding('utf8');

            response.on('data', function (data) {
                responseString += data;
            });

            response.on('end', function () {
                logger.info('GITHUB webhook created with response ' + responseString);
            });
        });

        request.on('error', function (e) {
            logger.info('Error occured while trying to set up webhook');
        });

        logger.info('Authorization token: "' + token + '" . Repo string: "' + repoString + '"');
        request.write(repoString);

        request.end();

    });

};
