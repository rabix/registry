'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Revision = mongoose.model('Revision');
var Repo = mongoose.model('Repo');

var filters = require('../../common/route-filters');
var validator = require('../../common/validator');

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Get all tool revisions
 *
 * @apiName GetToolRevisions
 * @api {GET} /api/revisions Get tool revisions
 * @apiGroup Tools
 * @apiDescription Fetch all tool revisions
 *
 * @apiParam {integer} limit=25 Revisions limit per page
 * @apiParam {integer} skip=0 Page offset
 * @apiParam {string} field_app_id ID of the app to which revisions belong to
 *
 * @apiUse UnauthorizedError
 *
 * @apiSuccess {Number} total Total number of revisions
 * @apiSuccess {Array} list List of revisions
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{revision}]
 *     }
 */
router.get('/revisions', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
        if (paramKey === 'q') {
            where.$or = [
                {name:  new RegExp(paramVal, 'i')},
                {description:  new RegExp(paramVal, 'i')}
            ];
        }
    });

    App.findById(req.query.field_app_id).populate('repo').exec(function(err, app) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var app_user_id = app.user.toString();

        if (app.repo.is_public || user_id === app_user_id) {

            Revision.count(where).exec(function(err, total) {
                if (err) { return next(err); }

                Revision.find(where).skip(skip).limit(limit).sort({version: 'desc'}).exec(function(err, revisions) {
                    if (err) { return next(err); }

                    res.json({list: revisions, total: total});
                });

            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 * Get revision by id
 *
 * @apiName GetToolRevision
 * @api {GET} /api/revisions/:id Get revision by id
 * @apiParam {String} id ID of the revision
 * @apiGroup Tools
 * @apiDescription Get tool revision
 * @apiUse UnauthorizedError
 *
 * @apiSuccess {Object} data Revision details
 * @apiSuccess {Object} app Parent tool details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {revision}
 *       "app": {tool}
 *     }
 */
router.get('/revisions/:id', function (req, res, next) {

    Revision.findById(req.params.id, function(err, revision) {
        if (err) { return next(err); }

        App.findById(revision.app_id).populate('repo').populate('user').exec(function(err, app) {
            if (err) { return next(err); }

            var user_id = (req.user ? req.user.id : '').toString();
            var app_user_id = app.user._id.toString();

            if (app.repo.is_public || user_id === app_user_id) {

                app.json = _.isString(app.json) ? JSON.parse(app.json) : app.json;
                revision.json = _.isString(revision.json) ? JSON.parse(revision.json) : revision.json;

                res.json({data: revision, app: app});

            } else {
                res.status(401).json({message: 'Unauthorized'});
            }

        });

    });

});

/**
 * Create new revision
 *
 * @apiName CreateToolRevision
 * @api {POST} /api/revisions Create new tool revision
 * @apiGroup Tools
 * @apiDescription Create new tool revision
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 * @apiUse InvalidToolError
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} revision Tool revision details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Revision has been successfully created"
 *       "revision": {revision}
 *     }
 */
router.post('/revisions', filters.authenticated, function (req, res, next) {

    var data = req.body;

    var check = validator.validate(data.tool);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    App.findById(data.app_id, function(err, app) {

        var user_id = req.user.id.toString();
        var app_user_id = app.user.toString();

        if (user_id === app_user_id) {

            Revision.findOne({app_id: data.app_id}).sort({_id: 'desc'}).exec(function(err, r) {

                data.tool['@type'] = app.is_script ? 'Script' : 'CommandLine';

                var revision = new Revision();

                revision.name = app.name;
                revision.description = data.tool.description;
                revision.script = data.tool.script;
                revision.author = data.tool.documentAuthor;
                revision.json = JSON.stringify(data.tool);
                revision.app_id = data.app_id;
                revision.version = r ? (r.version + 1) : 1;

                revision.save(function(err) {
                    if (err) { return next(err); }

                    app.revisions.push(revision._id);

                    app.json = revision.json;
                    app.description = revision.description;
                    app.script = revision.script;
                    app.author = revision.author;

                    app.save(function(err) {
                        if (err) { return next(err); }

                        res.json({revision: revision, message: 'Revision has been successfully created'});
                    });
                });
            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 *
 * Delete revision by id
 *
 * @apiName DeleteTool
 * @api {DELETE} /api/revisions/:id Delete revision by id
 * @apiGroup Tools
 * @apiDescription Delete tool revision
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 *
 * @apiError message Forbidden revision delete from public repo
 * @apiErrorExample {json} PublicRepoError:
 *     HTTP/1.1 403 Bad Request
 *     {
 *       "message": "This revision belongs to public repo and it can't be delete it"
 *     }
 *
 * @apiError message Forbidden revision delete if it's the last one
 * @apiErrorExample {json} LastRevisionError:
 *     HTTP/1.1 403 Bad Request
 *     {
 *       "message": "This is the only revision of the tool so it can't be deleted"
 *     }
 *
 * @apiSuccess {String} message Success message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "message": "Revision successfully deleted"
 *     }
 */
router.delete('/revisions/:id', filters.authenticated, function (req, res, next) {

    Revision.findOne({_id: req.params.id}).populate('app_id').exec(function (err, revision) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var app_user_id = revision.app_id.user.toString();

        if (user_id === app_user_id) {

            Revision.count({app_id: revision.app_id._id}, function(err, count) {
                if (err) { return next(err); }

                if (count === 1) {

                    res.status(403).json({message: 'This is the only revision of the tool so it can\'t be deleted'});

                } else {
                    Repo.findById(revision.app_id.repo, function(err, repo) {
                        if (err) { return next(err); }

                        if (repo.is_public) {

                            // TODO: allow revision delete from public repo?

                            res.status(403).json({message: 'This revision belongs to public repo and it can\'t be delete it'});

                        } else {
                            Revision.remove({_id: req.params.id}, function (err) {
                                if (err) { return next(err); }

                                res.json({message: 'Revision successfully deleted'});

                            });
                        }
                    });
                }
            });


        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    });

});


