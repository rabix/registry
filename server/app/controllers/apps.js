'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Repo = mongoose.model('Repo');
var Revision = mongoose.model('Revision');

var filters = require('../../common/route-filters');
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

    App.count(where).exec(function(err, total) {
        if (err) { return next(err); }

        App.find(where).populate('revisions', 'name order json').skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, apps) {
            if (err) { return next(err); }

            res.json({list: apps, total: total});
        });

    });

});

router.get('/apps/:id', function (req, res, next) {

    App.findById(req.params.id).populate('user_id').exec(function(err, app) {
        if (err) { return next(err); }

        res.json({data: app});
    });

});


router.put('/apps', filters.authenticated, function (req, res, next) {

    var data = req.body;

    // TODO: Validate app JSON
//    Validator.validateApp(data);

    App.findById(data.app_id, function(err, app) {
        if (err) { return next(err); }

        var desc = data.tool.softwareDescription;

        app.name = desc.name;
        app.description = desc.description;
        app.author = data.tool.documentAuthor;
        app.json = data.tool;
        app.links = {
            json: ''
        };
        app.revisions = [];

        app.repo_name = desc.repo_name || '';
        app.repo_owner = desc.repo_owner || '';

        Repo.findOne({'name': desc.repo_name, 'owner': desc.repo_owner}, function (err, repo) {

            if (repo) { app.repo_id = repo._id; }

            var folder = app.repo_owner + '-' + app.repo_name;

            Amazon.createFolder(folder);
            Amazon.uploadJSON(app.name+'.json', app.json, folder);
            Amazon.getFileUrl(app.name+'.json', folder, function (url) {

                app.links.json = url;

                app.save(function(err) {
                    if (err) { return next(err); }

                    Revision.find({app_id: data.app_id}).remove(function(err) {
                        if (err) { return next(err); }
                        res.json(app);
                    });
                });
            });

        });

    });

});


router.post('/apps', filters.authenticated, function (req, res, next) {
    var data = req.body;

    // TODO: Validate app JSON
//    Validator.validateApp(data);

    var desc = data.softwareDescription;

    var app = new App();

    app = _.extend(app, data);

    app.name = desc.name;
    app.description = desc.description;
    app.author = data.documentAuthor;
    app.json = data;
    app.links = {
        json: ''
    };

    app.repo_name = desc.repo_name || '';
    app.repo_owner = desc.repo_owner || '';

    Repo.findOne({'name': desc.repo_name, 'owner': desc.repo_owner}, function (err, repo) {

        if (repo) { app.repo_id = repo._id; }

        var folder = app.repo_owner + '-' + app.repo_name;

        Amazon.createFolder(folder);
        Amazon.uploadJSON(app.name+'.json', app.json, folder);
        Amazon.getFileUrl(app.name+'.json', folder, function (url) {
            app.links.json = url;

            app.user_id = req.user.id;
            app.save();

            res.json(app);
        });

    });

});

router.delete('/apps', filters.authenticated, function (req, res, next) {

});


