'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Build = mongoose.model('Build');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/builds', function (req, res, next) {

    Build.find().populate('repoId').exec(function(err, builds) {
        if (err) return next(err);

        res.json({list: builds, total: builds.length});
    });

});
