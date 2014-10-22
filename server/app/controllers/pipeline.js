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

var raw_pipeline_model = {
    stamp: {
        created_by: '',
        created_on: '',
        modified_by: '',
        modified_on: ''
    },
    display: {
        canvas: {
            x: 0,
            y: 0,
            zoom: 1
        },
        description: '',
        name: '',
        nodes: {}
    },
    nodes: [],
    relations: [],
    schemas: []
};

var packed_raw_pipeline_model = {
    stamp: {
        created_by: '',
        created_on: '',
        modified_by: '',
        modified_on: ''
    },
    display: {
        canvas: {
            x: 0,
            y: 0,
            zoom: 1
        },
        description: '',
        name: '',
        nodes: {}
    },
    // realtions -> steps
    steps: [],
    // nodes -> apps
    apps: {},
    // inputs from relations -> inputs (remove relations)
    inputs: {},
    // outputs from relations -> outputs (remove relations)
    outputs: {}
};


module.exports = function (app) {
    app.use('/api', router);
};

router.get('/pipeline/format', function (req, res, next) {
    fs.readFile('/Users/filip/SBG/rabix/registry/pipeline-editor/data/clean_pipeline.json', 'utf8', function (err, data) {
        var json = JSON.parse(data);

        var r = formater.toRabixSchema(json);

        var t = formater.toPipelineSchema(r);
        res.json(t);
    });
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

router.get('/pipeline/:id', function (req, res, next) {

    Pipeline.findById(req.params.id).exec(function(err, pipeline) {
        if (err) { return next(err); }

        res.json({data: pipeline});
    });

});

router.post('/pipeline', function (req, res, next) {
    var pipeline = req.body.data;

    formater.toRabixSchema(pipeline);
});

router.put('/pipeline', function (req, res, next) {
    var pipeline = new Pipeline();
    var model = _.clone(packed_raw_pipeline_model);

    pipeline = _.extend(pipeline, model);

    pipeline.save();

    res.json(raw_pipeline_model);
});


