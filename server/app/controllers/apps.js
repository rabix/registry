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
        if (paramKey === 'q') {
            where.$or = [
                {name: new RegExp(paramVal, 'i')},
                {description: new RegExp(paramVal, 'i')}
            ];
        }
    });

    if (req.user && req.param('mine')) {
        where.user_id = req.user.id;
    }

    App.count(where).exec(function(err, total) {
        if (err) { return next(err); }

        App.find(where).populate('revisions', 'name json').skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, apps) {
            if (err) { return next(err); }

            res.json({list: apps, total: total});
        });

    });

});

router.get('/repositories/:type', function (req, res, next) {

    var type = req.params.type;
    var where = {};

    if (req.query.q) {
        where.$or = [
            {repo_name: new RegExp(req.query.q, 'i')},
            {repo_owner: new RegExp(req.query.q, 'i')},
            {name: new RegExp(req.query.q, 'i')},
            {description: new RegExp(req.query.q, 'i')}
        ];
    }

    if (type === 'my') {
        if (!req.user) {
            res.json({message: 'Log in to see your repositories'});
            return false;
        }
        where.user_id = req.user.id;
    } else {
        if (req.user) {
            where.user_id = {$ne: req.user.id};
        }
    }

    App.find(where, 'repo_name repo_owner name description json').sort({_id: 'desc'}).exec(function(err, apps) {
        if (err) { return next(err); }

        var grouped = _.groupBy(apps, function (app) {
            return app.repo_owner + '/' + app.repo_name;
        });

        res.json({list: grouped});
    });

});

router.get('/apps/:id/:revision', function (req, res, next) {

    App.findById(req.params.id).populate('user_id').exec(function(err, app) {
        if (err) { return next(err); }

        if (req.params.revision === 'public') {

            res.json({data: app});

        } else {

            var params = (req.params.revision === 'latest') ? {} : {_id: req.params.revision};

            Revision.findOne(params).sort({_id: 'desc'}).exec(function(err, revision) {
                if (err) { return next(err); }

                app.name = revision.name;
                app.description = revision.description;
                app.author = revision.author;
                app.json = revision.json;

                res.json({data: app, revision: {id: revision._id, version: revision.version}});
            });
        }

    });

});


router.put('/apps/:id/:revision', filters.authenticated, function (req, res, next) {

    var data = req.body;
    var app_id = req.params.id;

    var check = validator.validate(data.tool);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    App.findById(app_id, function(err, app) {
        if (err) { return next(err); }

        var desc = data.tool.softwareDescription;

        app.name = desc.name;
        app.description = desc.description;
        app.author = data.tool.documentAuthor;
        app.json = data.tool;
        app.links = {json: ''};

        var folder = 'users/' + req.user.login + '/apps/' + app.repo_owner + '-' + app.repo_name;

        Amazon.createFolder(folder)
            .then(function () {

                Amazon.uploadJSON(app.name + '.json', app.json, folder)
                    .then(function () {

                        Amazon.getFileUrl(app.name + '.json', folder, function (url) {

                            app.links.json = url;

                            Revision.findOne({_id: req.params.revision, app_id: app_id}, function(err, revision) {
                                if (err) { return next(err); }

                                if (revision) {

                                    revision.name = app.name;
                                    revision.description = app.description;
                                    revision.author = app.author;
                                    revision.json = app.json;
                                    revision.is_public = true;

                                    revision.save();

                                }

                                app.save();

                                res.json({app: app, message: 'App has been successfully updated'});

                            });

                        });

                    }, function (error) {
                        res.status(500).json(error);
                    });
            }, function (error) {
                res.status(500).json(error);
            });

    });

});


router.post('/apps/:action', filters.authenticated, function (req, res, next) {

    var data = req.body;

    var check = validator.validate(data.tool);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    var desc = data.tool.softwareDescription;

    var app = new App();

    app.name = desc.name;
    app.description = desc.description;
    // TODO: on fork should we change author's email as well??
    app.author = data.tool.documentAuthor;
    app.json = data.tool;
    app.links = {json: ''};

    app.repo_name = desc.repo_name || '';

    if (req.params.action === 'fork') {
        app.repo_owner = req.user.login;
        app.json.softwareDescription.repo_owner = req.user.login;
        desc.repo_owner = req.user.login;
    } else {
        app.repo_owner = desc.repo_owner || '';
    }

    Repo.findOne({'name': desc.repo_name, 'owner': desc.repo_owner}, function (err, repo) {

        if (repo) { app.repo_id = repo._id; }

        var folder = 'users/' + req.user.login + '/apps/' + app.repo_owner + '-' + app.repo_name;

        Amazon.createFolder(folder)
            .then(function () {
                Amazon.uploadJSON(app.name + '.json', app.json, folder)
                    .then(function () {

                        Amazon.getFileUrl(app.name + '.json', folder, function (url) {

                            app.links.json = url;
                            app.user_id = req.user.id;

                            var revision = new Revision();

                            revision.name = app.name;
                            revision.description = app.description;
                            revision.author = app.author;
                            revision.json = app.json;
                            revision.app_id = app._id;
                            revision.is_public = true;

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
    });

});

router.post('/validate', filters.authenticated, function (req, res, next) {

    var data = req.body;

    var check = validator.validate(data);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    res.json(data);

});

router.delete('/apps/:id', filters.authenticated, function (req, res, next) {

    App.findOne({_id: req.params.id}, function (err, app) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var app_user_id = app.user_id.toString();

        if (user_id === app_user_id) {

            Revision.remove({app_id: req.params.id});

            App.remove({_id: req.params.id}, function (err) {
                if (err) { return next(err); }

                res.json({message: 'App successfully deleted'});

            });
        } else {
            res.status(500).json({message: 'Unauthorized'});
        }
    });

});

