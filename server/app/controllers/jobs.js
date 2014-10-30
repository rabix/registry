'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var uuid = require('node-uuid');

var Job = mongoose.model('Job');

var filters = require('../../common/route-filters');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/jobs', filters.authenticated, function (req, res, next) {

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

        Amazon.uploadJSON(file_name, json, 'others').then(function () {
            Amazon.getFileUrl(file_name, 'others', function (url) {
                res.json({
                    url: url
                });
            });
        });

    }

});