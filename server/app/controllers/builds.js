'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var Build = mongoose.model('Build');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/builds', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
    });

    Build.count().where(where).exec(function(err, total) {
        if (err) { return next(err); }

        Build.find().where(where).skip(skip).limit(limit).populate('repoId').exec(function(err, builds) {
            if (err) { return next(err); }

            res.json({list: builds, total: total});
        });
    });

});

router.get('/builds/:id', function (req, res, next) {

    Build.findById(req.params.id).populate('repoId').exec(function(err, build) {
        if (err) { return next(err); }

        res.json({data: build});
    });

});

router.get('/builds/:id/log', function (req, res, next) {

    // TODO get build log
    res.json('CONTENT');

});