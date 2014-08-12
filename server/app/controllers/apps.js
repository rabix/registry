'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var App = mongoose.model('App');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/apps', function (req, res, next) {

    App.find().populate('repoId').exec(function(err, apps) {
        if (err) return next(err);

        res.json({list: apps, total: apps.length});
    });

});
