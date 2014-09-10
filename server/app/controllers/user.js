'use strict';

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var filters = require('../../common/route-filters');
var https = require('https');
var _ = require('lodash');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/user', function (req, res, next) {

    res.json({user: req.user});

});

router.get('/user/token', filters.authenticated, function (req, res, next) {

    User.findOne({email: req.user.email}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

router.put('/user/token', filters.authenticated, function (req, res, next) {

    var token = uuid.v4();

    User.findOneAndUpdate({email: req.user.email}, {token: token}, {}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

router.delete('/user/token', filters.authenticated, function (req, res, next) {

    User.findOneAndUpdate({email: req.user.email}, {token: ''}, {}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});
