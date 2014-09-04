'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var Build = mongoose.model('Build');

var fs = require('fs');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/builds', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function (paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
    });

    Build.count(where, function (err, total) {

        if (err) {
            return next(err);
        }

        if (total !== 0) {


            Build.find(where).skip(skip).limit(limit).populate('repoId').sort({_id: 'desc'}).exec(function (err, builds) {
                if (err) {
                    return next(err);
                }

                res.json({list: builds, total: total});
            });

        } else {
            res.json({list: [], total: total});
        }
    });

});

router.get('/builds/:id', function (req, res, next) {

    Build.findOne({"head_commit.id": req.params.id}).populate('repoId').exec(function (err, build) {
        if (err) {
            return next(err);
        }

        res.json({ data: build});
    });

});

router.get('/builds/:id/log', function (req, res, next) {

    Build.findOne({"head_commit.id": req.params.id}, function (err, build) {

        fs.readFile(build.log_dir, 'utf8', function (err, log) {
            console.log(log.length);
            res.json({
                status: build.status,
                content: log,
                contentLength: log.toString().length
            });
        });
    });

});
