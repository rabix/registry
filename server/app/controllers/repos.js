'use strict';

var express = require('express');
var router = express.Router();
var https = require('https');
var _ = require('lodash');
var uuid = require('node-uuid');
var Q = require('q');
var path = require('path');

var config = require('../../config/config');

var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

var bodyParser = require('body-parser');

var filters = require('../../common/route-filters');

var logger = require('../../common/logger');

// Start Requirements for build

var sys = require('sys');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var mkdir = require('mkdirp');

var git = require('gift');

var fs = require('fs');

// Ebd Requirements for build

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

        //TODO: check if you can return just without next

//        return next()
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
        console.log(user, req.user);
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
    var github_delivery = req.headers['x-github-delivery'];
    var head_commit = req.param('head_commit');

    if (event_type === 'push') {
//        R.startBuild(repo);
        logger.info('[commit/push]: Author: "' + head_commit.author.username + '"  "' + head_commit.id + '". There goes push to a repo: ' + repo.name);
        logger.info('[build/trigger]: starting build for repo "'+ repo.name +'"');

        startBuild(repo, head_commit);


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

        if (!token) {
            logger.error('Token not found for user: "'+owner+'"');
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

var startBuild = function (repository, head_commit) {

    var sha = head_commit.id;
    var buildDir = path.normalize('/data/rabix-registry/builds');
    var folder = buildDir + '/build_' +  repository.name + '_' + sha;

    mkdir(folder , function(err){

        if (err) {
            throw err;
        }

        var r = git.clone(repository.url, folder, function (err,repo) {
            if (err) {
                throw err;
            }

            repo.checkout(sha, function(err, commit){

                if (err) {
                    throw new Error(err);
                }

                logger.info('Build for repo "'+ repository.full_name +'" for commit "'+ sha+'" started');

//                var child = exec("rabix build", { cwd: folder } , function (error, stdout, stderr) {
//
//                    sys.print('stdout: ' + stdout);
//
//                    sys.print('stderr: ' + stderr);
//
//                    if (error !== null) {
//                        console.log('exec error: ' + error);
//                    }
//
//                    if (child.exitCode === 0) {
//                        logger.info('Build for repo "'+ repository.full_name +'" for commit "'+ sha+'" endded succesfully');
//                    } else if (child.exitCode === 1) {
//                        logger.error('Build for repo "'+ repository.full_name +'" for commit "'+ sha+'" failed');
//                    } else {
//                        logger.error('Unknown status code returned for repo "'+ repository.full_name +'" commit "'+ sha+'"');
//                    }
//
//                });

                // Prepare build logs for writing
                var logPath = path.normalize('/data/log/rabix-registry/builds'),
                    stdoutLog = fs.openSync(logPath + '/build_' +  repository.name + '_' + sha + '_stdout.log', 'a'),
                    stderrLog = fs.openSync(logPath + '/build_' +  repository.name + '_' + sha + '_stderr.log', 'a');


                var rabix = spawn('rabix', ['build'], {
                    cwd: folder,
                    detached: true,
                    stdio: [ 'ignore', stdoutLog, stderrLog ]
                });
                
                rabix.on('close', function (code) {
                    if (code === 0) {
                        logger.info('Build for repo "'+ repository.full_name +'" for commit "'+ sha+'" endded succesfully with status code of : ' + code);
                    } else if (code === 1) {
                        logger.error('Build for repo "'+ repository.full_name +'" for commit "'+ sha+'" failed with status code of : ' + code);
                    } else {
                        logger.error('Unknown status code returned for repo "'+ repository.full_name +'" commit "'+ sha+'" with status code of : ' + code);
                    }
                });


            });

        });

    });
};
