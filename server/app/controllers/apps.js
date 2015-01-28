'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var Q = require('q');

var App = mongoose.model('App');
var Repo = mongoose.model('Repo');
var Revision = mongoose.model('Revision');

var filters = require('../../common/route-filters');
var validator = require('../../common/validator');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * @apiDefine InvalidToolError
 * @apiError message Invalid tool
 * @apiErrorExample {json} InvalidToolError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid tool"
 *     }
 */

/**
 * Get all Tools
 *
 * @apiName GetTools
 * @api {GET} /api/apps Get all Tools
 * @apiGroup Repos
 * @apiDescription Fetch all Tools
 *
 * @apiParam {integer} limit=25 Tools limit per page
 * @apiParam {integer} skip=0 Page offset
 * @apiParam {string} q Search term
 * @apiParam {boolean} mine=false Defines if only logged-in user's tools should be displayed
 * @apiParam {boolean} is_script=false Defines if script tools should be displayed
 *
 * @apiSuccess {Number} total Total number of tools
 * @apiSuccess {Array} list List of tools
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{tool}]
 *     }
 */
router.get('/apps', function (req, res, next) {

    var limit = req.query.limit || 25;
    var skip = req.query.skip || 0;
    var is_script = req.query.is_script || false;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
    });

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

    Repo.find(where, function(err, repos) {
        if (err) { return next(err); }

        var whereApps = {repo: {$in: _.pluck(repos, '_id')}};

        if (is_script) {
            whereApps.is_script = true;
        } else {
            // TODO: legacy structure, some tools don't have is_script field, will be obsolete on fresh db
            whereApps.is_script = {$in: [null, false]};
        }

        if (req.query.q) {
            whereApps.$or = [
                {name: new RegExp(req.query.q, 'i')},
                {description: new RegExp(req.query.q, 'i')}
            ];
        }

        App.count(whereApps, function(err, total) {
            if (err) { return next(err); }

            App.find(whereApps)
                .populate('repo')
                .populate('user')
                .populate({
                    path: 'revisions',
                    options: { limit: 25 },
                    sort: {
                        _id: 'desc'
                    }
                })
                .skip(skip).limit(limit).sort({_id: 'desc'})
                .exec(function(err, apps) {
                    if (err) { return next(err); }

                    res.json({list: apps, total: total});
                });
        });

    });

});

/**
 * Get grouped tools and scripts
 *
 * @apiName GetToolsGroupedByRepo
 * @api {GET} /api/tool/repositories/:type Get grouped tools and scripts
 * @apiParam {string="my","other"} type Defines whose repos to fetch
 * @apiGroup Tools
 * @apiDescription Fetch tools and scripts grouped by repo
 *
 * @apiSuccess {Object} list List of tools and scripts grouped by repo
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "list": {tools: [tools], scripts: [scripts]}
 *     }
 */
router.get('/tool/repositories/:type', function (req, res, next) {

    var type = req.params.type;
    var where = {};

    if (type === 'my') {
        if (!req.user) {
            res.json({message: 'Log in to see your repositories'});
            return false;
        }
        where.user = req.user.id;
    } else {
        if (req.user) {
            where.user = {$ne: req.user.id};
        }
        where.is_public = true;
    }

    var getRevisions = function(where, apps) {

        var promise = new mongoose.Promise();

        Revision.find(where).sort({_id: 'desc'}).exec(function(err, revisions) {
            if (err) { return next(err); }

            var groupedRevisions = _.groupBy(revisions, 'app_id');

            var appsWithRevisions = apps.map(function(app) {
                var tmp = app.toObject();
                tmp.name = app.name;
                tmp.revisions = groupedRevisions[tmp._id];
                return tmp;
            });

            var grouped = _.groupBy(appsWithRevisions, function (app) {
                return app.repo.owner + '/' + app.repo.name;
            });

            promise.fulfill(grouped);

        });

        return promise;
    };

    Repo.find(where, function(err, repos) {
        if (err) { return next(err); }

        var whereApps = {
            repo: {$in: _.pluck(repos, '_id')},
            $or: [
                {name: new RegExp(req.query.q, 'i')},
                {description: new RegExp(req.query.q, 'i')}
            ]
        };

        App.find(whereApps, '_id repo user name is_script').populate('repo').sort({_id: 'desc'}).exec(function(err, apps) {
            if (err) { return next(err); }

            var tools = _.filter(apps, function(a) {return !a.is_script;});
            var scripts = _.filter(apps, function(a) {return a.is_script;});

            Q.all([
                    getRevisions({app_id: {$in: _.pluck(tools, '_id')}}, tools),
                    getRevisions({app_id: {$in: _.pluck(scripts, '_id')}}, scripts)
                ]).then(function(result) {

                    res.json({list: {tools: result[0], scripts: result[1]}});

                }).fail(function(error) {
                    res.json(error);
                });

        });

    });



});

/**
 * Get tool by revision
 *
 * @apiName GetTool
 * @api {GET} /api/apps/:id/:revision Get tool by revision
 * @apiParam {String} id ID of the tool
 * @apiParam {String} revision ID of the revision
 * @apiGroup Tools
 * @apiDescription Get tool by revision
 * @apiUse UnauthorizedError
 *
 * @apiSuccess {Object} data Tool details
 * @apiSuccess {Object} revision Tool revision details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {tool}
 *       "revision": {tool-revision}
 *     }
 */
router.get('/apps/:id/:revision', function (req, res, next) {

    App.findById(req.params.id).populate('user').populate('repo').exec(function(err, app) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var app_user_id = app.user._id.toString();

        if (app.repo.is_public || user_id === app_user_id) {

            var where = (req.params.revision === 'latest') ? {app_id: req.params.id} : {_id: req.params.revision};

            Revision.findOne(where).sort({version: 'desc'}).exec(function(err, revision) {
                if (err) { return next(err); }

                app.json = _.isString(app.json) ? JSON.parse(app.json) : app.json;
                revision.json = _.isString(revision.json) ? JSON.parse(revision.json) : revision.json;

                res.json({data: app, revision: revision});

            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 * Create new tool
 *
 * @apiName CreateTool
 * @api {POST} /api/apps/:action Create new tool
 * @apiParam {String="create","fork"} action Type of the action
 * @apiGroup Tools
 * @apiDescription Create new tool from clean template or by forking it
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 * @apiUse NameCollisionError
 * @apiUse InvalidToolError
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} app Tool details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Tool has been successfully created"
 *       "app": {tool}
 *     }
 */
router.post('/apps/:action', filters.authenticated, function (req, res, next) {

    var data = req.body;

    var check = validator.validate(data.tool);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    var name = (req.params.action === 'fork') ? data.name : data.tool.name;

    App.count({name: name}).exec(function(err, count) {
        if (err) { return next(err); }

        if (count > 0) {
            res.status(400).json({message: 'The "'+name+'" tool already exists, please choose another name!'});
        } else {

            data.tool['@type'] = data.is_script ? 'Script' : 'CommandLine';

            var app = new App();

            app.name = name;
            data.tool.name = name;
            app.description = data.tool.description;
            app.script = data.tool.script;
            app.author = req.user.login;
            app.json = JSON.stringify(data.tool);
            app.links = {json: ''};
            app.is_script = data.is_script;

            Repo.findById(data.repo_id).populate('user').exec(function (err, repo) {

                var user_id = req.user.id.toString();
                var repo_user_id = repo.user._id.toString();

                if (repo.is_public || user_id === repo_user_id) {

                    app.repo = repo._id;

                    app.json.documentAuthor = app.author;

                    var folder = 'users/' + req.user.login + '/apps/' + repo.owner + '-' + repo.name;

                    Amazon.createFolder(folder)
                        .then(function () {
                            Amazon.uploadJSON(app.name + '.json', app.json, folder)
                                .then(function () {

                                    Amazon.getFileUrl(app.name + '.json', folder, function (url) {

                                        app.links.json = url;
                                        app.user = req.user.id;

                                        var revision = new Revision();

                                        revision.name = app.name;
                                        revision.description = app.description;
                                        revision.script = app.script;
                                        revision.author = app.author;
                                        revision.json = app.json;
                                        revision.job = JSON.stringify(data.job);
                                        revision.app_id = app._id;

                                        revision.save(function(err) {
                                            if (err) { return next(err); }

                                            app.revisions.push(revision._id);

                                            app.save(function() {
                                                res.json({app: app, message: 'Tool has been successfully created'});
                                            });

                                        });

                                    });

                                }, function (error) {
                                    res.status(500).json(error);
                                });
                        }, function (error) {
                            res.status(500).json(error);
                        });

                } else {
                    res.status(401).json({message: 'Unauthorized'});
                }
            });
        }
    });

});

/**
 *
 * Validate tool json
 *
 * @apiName ValidateWorkflow
 * @api {POST} /api/validate Validate tool json
 * @apiGroup Tools
 * @apiDescription Validate tool json
 * @apiUse InvalidToolError
 *
 * @apiSuccess {Object} json Successfully passed validation
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        {json}
 *     }
 */
router.post('/validate', function (req, res) {

    var data = req.body;

    var check = validator.validate(data);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    res.json(data);

});

/**
 *
 * Delete tool and it's revisions
 *
 * @apiName DeleteTool
 * @api {DELETE} /api/apps/:id Delete tool
 * @apiParam {String} id ID of the tool
 * @apiGroup Tools
 * @apiDescription Delete tool
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 *
 * @apiError message Forbidden tool delete from the public repo
 * @apiErrorExample {json} PublicRepoError:
 *     HTTP/1.1 403 Bad Request
 *     {
 *       "message": "This app belongs to public repo and it can't be deleted."
 *     }
 *
 * @apiSuccess {String} message Success message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "message": "Tool successfully deleted"
 *     }
 */
router.delete('/apps/:id', filters.authenticated, function (req, res, next) {

    App.findOne({_id: req.params.id}).populate('repo').exec(function (err, app) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var app_user_id = app.user.toString();

        if (user_id === app_user_id) {

            if (app.repo.is_public) {

                // TODO: allow app delete from public repo?

                res.status(403).json({message: 'This app belongs to public repo and it can\'t be deleted.'});

            } else {

                Revision.remove({app_id: req.params.id}, function(err) {
                    if (err) { return next(err); }

                    App.remove({_id: req.params.id}, function (err) {
                        if (err) { return next(err); }

                        res.json({message: 'Tool successfully deleted'});
                    });
                });

            }

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    });

});