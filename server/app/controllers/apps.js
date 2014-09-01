'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var App = mongoose.model('App');
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

        App.find(where).skip(skip).limit(limit).populate('repoId').exec(function(err, apps) {
            if (err) { return next(err); }

            res.json({list: apps, total: total});
        });

    });

});

router.get('/apps/:id', function (req, res, next) {

    App.findById(req.params.id).populate('repoId').exec(function(err, app) {
        if (err) { return next(err); }

        res.json({data: app});
    });

});


router.put('/apps', filters.authenticateClient, function (req, res, next) {

});


router.post('/apps', filters.authenticateClient, function (req, res, next) {

});

router.delete('/apps', filters.authenticateClient, function (req, res, next) {

});


