'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var uuid = require('node-uuid');

var Job = mongoose.model('Job');

var filters = require('../../common/route-filters');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

router.post('/job/upload', function (req, res, next) {

    var json = req.body;
    var file_name = 'job-json-' + uuid.v4() + '.json';
    
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

});