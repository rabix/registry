'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/repos', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;

    Repo.count(function(err, total) {
        if (err) { return next(err); }

        Repo.find().skip(skip).limit(limit).exec(function(err, repos) {
            if (err) { return next(err); }

            res.json({list: repos, total: total});
        });
    });

});

router.get('/repos/:id', function (req, res, next) {

    Repo.findById(req.params.id, function(err, repo) {
        if (err) { return next(err); }

        res.json({data: repo});
    });

});
