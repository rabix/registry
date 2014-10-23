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

    Pipeline.findById('5448cadaaafdcef2111e81a5').exec(function(err, pipeline) {
        if (err) { return next(err); }

        var p = formater.toRabixSchema(pipeline.json);
//        delete pipeline.json.relations;
//        pipeline.json.steps = p.steps;

        p = formater.toPipelineSchema(p);
//        delete pipeline.json.steps;
//        pipeline.json.relations = p.relations;

        res.json({data: p});
    });

//    var r = formater.toRabixSchema(json);

//    var t = formater.toPipelineSchema(r);
//    res.json(t);
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

router.post('/pipeline', function (req, res) {

    var data = req.body.data;

    var pipeline = new Pipeline();

    pipeline.json = data.json;
    pipeline.name = data.name;
    pipeline.author = data.author;
    pipeline.description = data.description;

    pipeline.save();

    res.json({message: 'Pipeline successfully added', id: pipeline._id});

});

router.put('/pipeline/:id', function (req, res, next) {

    var data = req.body.data;

    Pipeline.findById(req.params.id).exec(function(err, pipeline) {
        if (err) { return next(err); }

        pipeline.json = data.json;
        pipeline.name = data.name;
        pipeline.author = data.author;
        pipeline.description = data.description;

        pipeline.save();

        res.json({message: 'Pipeline successfully updated'});
    });

});


