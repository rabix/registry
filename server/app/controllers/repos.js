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
var App = mongoose.model('App');
var Pipeline = mongoose.model('Pipeline');
var Job = mongoose.model('Job');

var BuildClass = require('../../builds/Build');

var filters = require('../../common/route-filters');

var logger = require('../../common/logger');

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Get repo appropriate information
 *
 * @param repo
 * @returns {mongoose.Promise}
 */
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

/**
 * Add GitHub webhook
 *
 * @param owner
 * @param r
 * @param currentUser
 */
var addWebhook = function (owner, r, currentUser) {

    User.findOne({ email: currentUser }, function (err, user) {

        if (err) {
            logger.info('User not found for user with email: ' + currentUser);
            return false;
        }

        var token = user.github.accessToken;

        if (!token) {
            logger.error('Token not found for user: "' + owner + '"');
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
            'name': 'web',
            'active': true,
            'events': [
                'push',
                'pull_request'
            ],
            'config': {
                'url': 'http://www.rabix.org/api/github-webhook',
                'content_type': 'json'
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
/**
 * @apiDefine UnauthorizedError
 * @apiError Message Unauthorized access
 * @apiErrorExample UnauthorizedError:
 *     HTTP/1.1 401
 *     {
 *       "message": "Unauthorized"
 *     }
 */

/**
 * @apiDefine NameCollisionError Name already in use
 * @apiError message The <code>name</code> already in use.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Name already in use"
 *     }
 */

/**
 * @apiName GetRepos
 * @api {GET} /api/repos Get all Repositories
 * @apiGroup Repos
 * @apiDescription Fetch all repositories
 *
 * @apiSuccess {Number} total Total number of repositories
 * @apiSuccess {Array} list List of repositories
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{repo}]
 *     }
 */
router.get('/repos', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    if (req.user) {
        if (req.param('mine')) {
            where.user = req.user.id;
        } else {
            where.$or = [
                {user: req.user.id},
                {is_public: true}
            ];
        }
    } else {
        where.is_public = true;
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
            res.json({list: repos, total: total});
        });
    });

});

/**
 * Get repos by user
 *
 * @apiName GetRepo
 * @api {GET} /api/repos/:id Get repository by id
 * @apiGroup Repos
 * @apiDescription Get repository by id
 *
 * @apiSuccess {Number} total Total number of user repositories
 * @apiSuccess {Array} list List of user repositories
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{repo}]
 *     }
 */
router.get('/repos/user', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;

    if (req.user && req.user.login) {
        Repo.count(function (err, total) {
            if (err) { return next(err); }

            Repo.find({owner: req.user.login}).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function (err, repos) {
                if (err) { return next(err); }

                res.json({list: repos, total: total});
            });

        });
    } else {



    }

});

/**
 * @apiName PostRepo
 * @api {POST} /api/repos Create user repository
 * @apiGroup Repos
 * @apiDescription Create user repository
 * @apiPermission Logged in user
 * @apiUse NameCollisionError
 *
 * @apiSuccess {Object} repo
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repo": {
 *           "_id" : "547854cbf76a100000ac84dd",
 *           "is_public" : true,
 *           "created_by" : "flipio",
 *           "name" : "test",
 *           "owner" : "flipio",
 *           "git" : false,
 *           "description" : "",
 *           "user" : "547854bcf76a100000ac84dc"
 *       }
 *     }
 */
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

/**
 * @apiName PutRepo
 * @api {PUT} /api/repos/:id/:action Update repository
 *
 * @apiGroup Repos
 * @apiDescription Update repository info or publish it
 *
 * @apiPermission Logged in user
 *
 * @apiParam {Number} id Repo unique id
 * @apiParam {String} action Action to perform on repo (update, publish)
 *
 * @apiUse UnauthorizedError
 *
 * @apiSuccess {Object} repo Repository object
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repo": {
 *           "_id" : "547854cbf76a100000ac84dd",
 *           "is_public" : true,
 *           "created_by" : "flipio",
 *           "name" : "test",
 *           "owner" : "flipio",
 *           "git" : false,
 *           "description" : "",
 *           "user" : "547854bcf76a100000ac84dc"
 *       },
 *       "message": "Successfully updated repo"
 *     }
 */
router.put('/repos/:id/:action', filters.authenticated, function (req, res, next) {

    var repo = req.body.repo;

    Repo.findOne({_id: req.params.id}, function (err, r) {

        if (r.user.toString() === req.user.id.toString()) {

            if (req.params.action === 'publish') {

                Repo.findOneAndUpdate({_id: req.params.id}, {is_public: true}, function(err) {
                    if (err) { return next(err); }

                    res.json({message: 'Successfully published repo'});

                });

            } else {
                Repo.findOne({name: repo.name, owner: req.user.login, _id: {$ne: r._id}}, function (err, check) {
                    if (err) { return next(err); }

                    if (!check) {

                        Repo.findOneAndUpdate({_id: req.params.id}, {name: repo.name, description: (repo.description || '')}, function(err, r) {
                            if (err) { return next(err); }

                            res.json({message: 'Successfully updated repo', repo: r});

                        });

                    } else {
                        res.status(400).json({message: 'Repo name already in use'});
                    }
                });
            }

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });
});

/**
 * Get repo by id
 *
 * @apiName GetRepo
 * @api {GET} /api/repos/:id/:action Update repository
 *
 * @apiGroup Repos
 * @apiDescription Update repository info or publish it
 *
 * @apiParam {Number} id Repo unique id
 * @apiSuccess {Object} Repo Object
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "repo": {
 *           "_id" : "547854cbf76a100000ac84dd",
 *           "is_public" : true,
 *           "created_by" : "flipio",
 *           "name" : "test",
 *           "owner" : "flipio",
 *           "git" : false,
 *           "description" : "",
 *           "user" : "547854bcf76a100000ac84dc"
 *       }
 *     }
 *
 */
router.get('/repos/:id', function (req, res, next) {

    Repo.findById(req.params.id).populate('user').exec(function (err, repo) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var repo_user_id = repo.user._id.toString();

        if (repo.is_public || user_id === repo_user_id) {

            res.json({repo: repo});

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 * Get repo's tools
 *
 * @apiName GetReposTools
 * @api {GET} /api/repo-tools/:id Get tools from repository
 *
 * @apiGroup Repos
 * @apiDescription Get tools from repository
 *
 * @apiParam {Number} id Repo unique id
 * @apiSuccess {Number} total Total number of tools in repository
 * @apiSuccess {Array} list List of tools in repository
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{tool}]
 *     }
 */
router.get('/repo-tools/:id', function(req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var is_script = req.query.is_script || false;
    var where = {repo: req.params.id};

    if (is_script) {
        where.is_script = true;
    } else {
        // NOTE: legacy structure, some tools don't have is_script field
        where.is_script = {$in: [null, false]};
    }

    Repo.findById(req.params.id).populate('user').exec(function(err, repo) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var repo_user_id = repo.user._id.toString();

        if (repo.is_public || user_id === repo_user_id) {
            App.count(where, function(err, total) {
                if (err) { return next(err); }

                App.find(where).populate('user').skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, apps) {
                    if (err) { return next(err); }

                    res.json({list: apps, total: total});
                });

            });
        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    });

});

/**
 * Get repo's workflows
 *
 * @apiName GetReposWorkflows
 * @api {GET} /api/repo-workflows/:id Get workflows from repository
 *
 * @apiGroup Repos
 * @apiDescription Get workflows from repository
 *
 * @apiParam {Number} id Repo unique id
 * @apiSuccess {Number} total Total number of workflows in repository
 * @apiSuccess {Array} list List of workflows in repository
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{workflow}]
 *     }
 */
router.get('/repo-workflows/:id', function(req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {repo: req.params.id};

    Repo.findById(req.params.id).populate('user').exec(function(err, repo) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var repo_user_id = repo.user._id.toString();

        if (repo.is_public || user_id === repo_user_id) {
            Pipeline.count(where, function(err, total) {
                if (err) { return next(err); }

                Pipeline.find(where).populate('user').populate('latest').skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, pipelines) {
                    if (err) { return next(err); }

                    res.json({list: pipelines, total: total});
                });

            });
        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    });

});

/**
 * Get repo's tasks
 *
 * @apiName GetReposTasks
 * @api {GET} /api/repo-tasks/:id Get tasks from repository
 *
 * @apiGroup Repos
 * @apiDescription Get tasks from repository
 *
 * @apiParam {Number} id Repo unique id
 * @apiSuccess {Number} total Total number of tasks in repository
 * @apiSuccess {Array} list List of tasks in repository
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{task}]
 *     }
 */
router.get('/repo-tasks/:id', function(req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {repo: req.params.id};

    Repo.findById(req.params.id).populate('user').exec(function(err, repo) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var repo_user_id = repo.user._id.toString();

        if (repo.is_public || user_id === repo_user_id) {
            Job.count(where, function(err, total) {
                if (err) { return next(err); }

                Job.find(where).populate('user').skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, tasks) {
                    if (err) { return next(err); }

                    res.json({list: tasks, total: total});
                });

            });
        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    });

});

/**
 * Create GitHub repo
 *
 * @apiIgnore Github repo creation should not be accessible via API
 */
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

/**
 * Get github repo
 *
 * @apiIgnore Github repo creation should not be accessible via API
 */
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

/**
 * @apiIgnore Github hook should not be accessible via API
 */
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
