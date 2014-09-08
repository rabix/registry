'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Revision = mongoose.model('Revision');
var Repo = mongoose.model('Repo');

var filters = require('../../common/route-filters');

module.exports = function (app) {
    app.use('/api', router);
};

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
                {name: new RegExp(paramVal, 'i')},
                {description: new RegExp(paramVal, 'i')}
            ];
        }
    });

    Revision.count(where).exec(function(err, total) {
        if (err) { return next(err); }

        Revision.find(where).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, apps) {
            if (err) { return next(err); }

            res.json({list: apps, total: total});
        });

    });

});

router.get('/revisions/:id', function (req, res, next) {

    Revision.findById(req.params.id).exec(function(err, revision) {
        if (err) { return next(err); }

        res.json({data: revision});
    });

});


router.post('/revisions', filters.authenticated, function (req, res, next) {
    var data = req.body;

    // TODO: Validate app JSON
//    Validator.validateApp(data.tool);

    var desc = data.tool.softwareDescription;

    var revision = new Revision();

    revision = _.extend(revision, data.tool);

    revision.name = desc.name;
    revision.description = desc.description;
    revision.author = data.tool.documentAuthor;
    revision.json = data.tool;

    revision.repo_name = desc.repo_name || '';
    revision.repo_owner = desc.repo_owner || '';

    Repo.findOne({'name': desc.repo_name, 'owner': desc.repo_owner}, function (err, repo) {

        if (repo) { revision.repo_id = repo._id; }

        revision.app_id = data.app_id;

        Revision.count(function(err, total) {
            if (err) { return next(err); }

            revision.order = total + 1;

            revision.save(function(err) {
                if (err) { return next(err); }

                App.findById(data.app_id, function(err, app) {
                    if (err) { return next(err); }

                    app.revisions.push(revision._id);
                    app.save();

                    res.json(revision);
                });

            });

        });

    });

});


