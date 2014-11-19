'use strict';

var express = require('express');
var router = express.Router();
var https = require('https');
var _ = require('lodash');
var uuid = require('node-uuid');
var Q = require('q');

var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

var BuildClass = require('../../builds/Build');

var filters = require('../../common/route-filters');

var logger = require('../../common/logger');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/repos', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    if (req.user && req.param('mine')) {
        where.user = req.user.id;
    }

    if (req.query.q) {
        where.$or = [
            {name: new RegExp(req.query.q, 'i')},
            {description: new RegExp(req.query.q, 'i')},
            {owner: new RegExp(req.query.q, 'i')}
        ];
    }

    Repo.count(where, function (err, total) {
        if (err) { return next(err); }

        Repo.find(where).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function (err, repos) {
            if (err) { return next(err); }
            console.log(repos, where);
            res.json({list: repos, total: total});
        });
    });

});

router.get('/repos/user', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;

    Repo.count(function (err, total) {
        if (err) { return next(err); }

        Repo.find({owner: req.user.login}).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function (err, repos) {
            if (err) { return next(err); }

            res.json({list: repos, total: total});
        });

    });

});

router.post('/repos', filters.authenticated, function (req, res, next) {
    var repo = req.body.repo,
        r;

    Repo.findOne({name: repo.name, owner: req.user.login}, function (err, check) {
        if (!check) {
            r = new Repo();

            r.name = repo.name;
            r.description = repo.description;
            r.owner = req.user.login;
            r.created_by = req.user.login;
            r.user = req.user.id;
            //TODO: Ask boysha about this secret (answered) but ask him again when the time comes
            r.secret = uuid.v4();
            r.git = false;

            r.save();

            res.json({repo: r});
        } else {
            res.status(400).json({message: 'Repo name already in use'});
        }
    });

});

router.put('/repos/:id', filters.authenticated, function (req, res, next) {

    var repo = req.body.repo;

    Repo.findOne({_id: req.params.id}, function (err, r) {

        if (r.owner === req.user.login && r.user === req.user.id) {

            Repo.findOne({name: repo.name, owner: req.user.login, _id: {$ne: r._id}}, function (err, check) {
                if (err) { return next(err); }

                if (!check) {

                    Repo.findOneAndUpdate({_id: req.params.id}, {name: repo.name, description: repo.description}, function(err) {
                        if (err) { return next(err); }

                        res.json({message: 'Successfully updated repo'});

                    });

                } else {
                    res.status(400).json({message: 'Repo name already in use'});
                }
            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });
});

router.get('/repos/:id', function (req, res, next) {

    Repo.findById(req.params.id, function (err, repo) {
        if (err) { return next(err); }

        res.json({data: repo});
    });

});

router.post('/github-repos', function (req, res, next) {

    var name = req.param('name');
    var owner = req.param('owner');
    var currentUser = req.user.email;

    Repo.count({name: name, owner: owner}, function (err, count) {
        if (err) {
            return next(err);
        }

        if (count === 0) {
            var repo = new Repo();
            repo.name = name;
            repo.owner = owner;
            repo.created_by = owner;
            repo.user = req.user.id;
            repo.secret = uuid.v4();
            repo.git = true;

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
        if (err) { return next(err); }
        var opts = {
            host: 'api.github.com',
            path: '/users/' + user.username + '/repos',
            headers: { 'User-Agent': 'Rabix' }
        };

        var request = https.get(opts, function (response) {

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
    var head_commit = req.param('head_commit');

    if (event_type === 'push') {
//        R.startBuild(repo);
        logger.info('[commit/push]: Author: "' + head_commit.author.username + '"  "' + head_commit.id + '". There goes push to a repo: ' + repo.name);
        logger.info('[build/trigger]: starting build for repo "' + repo.name + '"');

//        startBuild(repo, head_commit);

        var build = new BuildClass.Build({
            user: head_commit.author,
            repository: repo,
            head_commit: head_commit
        });

        build.startBuild();


    } else {
        logger.info('[event]:"' + event_type + '". There was activity on repo: ' + JSON.stringify(repo));

    }


});

var getRepoRow = function (repo) {

    var promise = new mongoose.Promise();
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

        if (!token) {
            logger.error('Token not found for user: "' + owner + '"');
//            throw Error('Token not found');
            return false;
        }

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