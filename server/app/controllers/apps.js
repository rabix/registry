'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Repo = mongoose.model('Repo');

var filters = require('../../common/route-filters');

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

        App.find(where).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, apps) {
            if (err) { return next(err); }

            res.json({list: apps, total: total});
        });

    });

});

router.get('/apps/:id', function (req, res, next) {

    App.findById(req.params.id).exec(function(err, app) {
        if (err) { return next(err); }

        res.json({data: app});
    });

});


router.put('/apps', filters.authenticated, function (req, res, next) {
    
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

        if (repo) {
            app.repo_id = repo._id;
        }

        app.save();
    });

    res.json(app);

});

router.delete('/apps', filters.authenticated, function (req, res, next) {

});


