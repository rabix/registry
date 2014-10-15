'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var fs = require('fs');

var Pipeline = mongoose.model('Pipeline');

var filters = require('../../common/route-filters');
var formater = require('../../pipeline/formater');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/pipeline/format', function (req, res, next) {
    fs.readFile('/home/filip/Projects/rabix/registry/pipeline-editor/data/pipeline.json', 'utf8', function (err, data) {
        var json = JSON.parse(data);

        var r = formater.toRabixSchema(json);

        res.json(r);
    })
});

router.get('/pipeline', function (req, res, next) {

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

    if (req.user && req.param('myApps')) {
        where.user_id = req.user.id;
    }

    Pipeline.count(where).exec(function(err, total) {
        if (err) { return next(err); }

        Pipeline.find(where).skip(skip).limit(limit).exec(function(err, apps) {
            if (err) { return next(err); }

            res.json({list: apps, total: total});
        });

    });
});

router.post('/pipeline', function (req, res, next) {
    
});

router.put('/pipeline', function (req, res, next) {
    var pipeline = new Pipeline();

    pipeline = _.extend(pipeline, req.body);

    pipeline.save();
});


