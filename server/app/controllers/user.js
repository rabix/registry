'use strict';

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Subscriber = mongoose.model('Subscriber');
var filters = require('../../common/route-filters');

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

router.post('/subscribe', function (req, res, next) {

    var email = req.param('email');

    Subscriber.findOne({email: email}, function(err, item) {
        if (err) { return next(err); }

        if (!item) {
            var subscriber = new Subscriber();
            subscriber.email = email;
            subscriber.save();
        }

        res.end();
    });

});
