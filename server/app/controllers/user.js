'use strict';

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/user', function (req, res, next) {
    res.json({user: req.user});
});

router.get('/user/token', authenticated, function (req, res, next) {

    var email = req.user.emails[0].value;

    User.findOne({email: email}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

router.put('/user/token', authenticated, function (req, res, next) {

    var email = req.user.emails[0].value;
    var token = uuid.v4();

    User.findOneAndUpdate({email: email}, {token: token}, {}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

router.delete('/user/token', authenticated, function (req, res, next) {

    var email = req.user.emails[0].value;

    User.findOneAndUpdate({email: email}, {token: ''}, {}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

function authenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.statusCode = 400;
    res.json({message: 'You must be logged in!'});
}