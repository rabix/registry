'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Repo = mongoose.model('Repo');
var Revision = mongoose.model('Revision');

var filters = require('../../common/route-filters');
var validator = require('../../common/validator');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/apps', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
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

        if (req.query.q) { whereApps.name = new RegExp(req.query.q, 'i'); }

        App.count(whereApps, function(err, total) {
            if (err) { return next(err); }

            App.find(whereApps).populate('repo').populate('user').populate('revisions').skip(skip).limit(limit).sort({_id: 'desc'})
                .exec(function(err, apps) {
                    if (err) { return next(err); }

                    res.json({list: apps, total: total});
                });
        });

    });

});

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

    Repo.find(where, function(err, repos) {
        if (err) { return next(err); }

        var whereApps = {
            repo: {$in: _.pluck(repos, '_id')},
            $or: [
                {name: new RegExp(req.query.q, 'i')},
                {description: new RegExp(req.query.q, 'i')}
            ]
        };

        App.find(whereApps, '_id repo user name').populate('repo').sort({_id: 'desc'}).exec(function(err, apps) {
            if (err) { return next(err); }

            var whereRev = {
                app_id: {$in: _.pluck(apps, '_id')}
            };

            Revision.find(whereRev).sort({_id: 'desc'}).exec(function(err, revisions) {
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

                res.json({list: grouped});

            });

        });

    });



});

router.get('/apps/:id/:revision', function (req, res, next) {

    App.findById(req.params.id).populate('user').populate('repo').exec(function(err, app) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var app_user_id = app.user._id.toString();

        if (app.repo.is_public || user_id === app_user_id) {

            var where = (req.params.revision === 'latest') ? {app_id: req.params.id} : {_id: req.params.revision};

            Revision.findOne(where).sort({version: 'desc'}).exec(function(err, revision) {
                if (err) { return next(err); }

                res.json({data: app, revision: revision});

            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

router.get('/run/:id', function (req, res, next) {

    // TODO: check if public?

    App.findById(req.params.id, function(err, app) {
        if (err) { return next(err); }

        if (app) {

            res.json(app.json);

        } else {
            Revision.findById(req.params.id, function(err, revision) {
                if (err) { return next(err); }

                if (revision) {
                    res.json(revision.json);
                } else {
                    res.status(400).json({message: 'This app doesn\'t exist'});
                }
            });
        }
    });

});

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

            var app = new App();

            app.name = name;
            app.description = data.tool.description;
            app.author = req.user.login;
            app.json = data.tool;
            app.links = {json: ''};

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
                                        revision.author = app.author;
                                        revision.json = app.json;
                                        revision.app_id = app._id;

                                        revision.save(function(err) {
                                            if (err) { return next(err); }

                                            app.revisions.push(revision._id);

                                            app.save();

                                            res.json({app: app, message: 'App has been successfully created'});
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

router.post('/validate', filters.authenticated, function (req, res) {

    var data = req.body;

    var check = validator.validate(data);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    res.json(data);

});

router.delete('/apps/:id', filters.authenticated, function (req, res, next) {

    App.findOne({_id: req.params.id}).populate('repo').exec(function (err, app) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var app_user_id = app.user.toString();

        if (user_id === app_user_id) {

            if (app.repo.is_public) {

                // TODO: allow app delete from public repo?

                res.status(400).json({message: 'This app belongs to public repo and it can\'t be deleted.'});

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
            res.status(500).json({message: 'Unauthorized'});
        }
    });

});