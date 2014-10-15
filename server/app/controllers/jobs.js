'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var uuid = require('node-uuid');
var fs = require('fs');
var config = require('../../config/config');

var Job = mongoose.model('Job');

var filters = require('../../common/route-filters');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/jobs', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {user_id: req.user.id};

    Job.count(where).exec(function(err, total) {
        if (err) { return next(err); }

        Job.find(where).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, jobs) {
            if (err) { return next(err); }

            res.json({list: jobs, total: total});
        });

    });

});

router.get('/jobs/:name', function (req, res, next) {

    var tmpDir = config.tmpDir.path;
    var fileName = req.params.name;
    var filePath = tmpDir + '/' + fileName;

    fs.exists(filePath, function (exists) {

        if (exists) {

            var today = (new Date()).getTime();
            var timestamp = fileName.split('job-json-')[1].split('.')[0];

            var diff = (today - parseInt(timestamp, 10)) / (1000*60*60);

            if (diff > 24) {

                fs.unlinkSync(filePath);

                res.json({message: 'This job has expired'});

            } else {
                fs.readFile(filePath,  'utf-8', function (err, data) {
                    if (err) { return next(err); }

                    res.json(JSON.parse(data));
                });
            }

        } else {
            res.json({message: 'This job json doesn\'t exist or it has expired'});
        }


    });

});

router.put('/jobs', function (req, res, next) {

    var tmpDir = config.tmpDir.path;
    var jobs = req.param('jobs') || [];

    fs.exists(tmpDir, function (exists) {
        if (!exists) { fs.mkdirSync(tmpDir); }

        fs.readdir(tmpDir, function (err, files) {
            if (err) { return next(err); }

            _.each(files, function (fileName) {

                var today = (new Date()).getTime();
                var timestamp = fileName.split('job-json-')[1].split('.')[0];

                var diff = (today - parseInt(timestamp, 10)) / (1000*60*60);
                if (diff > 24) {
                    fs.unlinkSync(tmpDir + '/' + fileName);

                    _.remove(jobs, function (job) {
                        return job === fileName;
                    });
                }
            });

            res.json({jobs: jobs});

        });

    });

});

router.post('/job/upload', function (req, res, next) {

    var json = req.body;
    var file_name;

    if (req.user) {

        file_name = 'job-json-' + uuid.v4() + '.json';

        Amazon.uploadJSON(file_name, json, 'users/' + req.user.login).then(function () {
            Amazon.getFileUrl(file_name, 'users/' + req.user.login, function (url) {
                var job = new Job();

                job.url = url;
                job.user_id = req.user.id;

                job.save();

                res.json({
                    url: url
                });
            });
        });

    } else {

        file_name = 'job-json-' + (new Date()).getTime() + '.json';

        var tmpDir = config.tmpDir.path;

        fs.exists(tmpDir, function (exists) {
            if (!exists) { fs.mkdirSync(tmpDir); }

            fs.writeFile(tmpDir + '/' + file_name, JSON.stringify(json), function (err) {
                if (err) { return next(err); }

                res.json({url: file_name});

            });

        });

    }

});