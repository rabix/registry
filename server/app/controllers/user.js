'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/user', function (req, res, next) {
    res.json({user: req.user});
});

router.get('/user/token', ensureAuthenticated, function (req, res, next) {
    User.find({})
    res.json({user: req.user});
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.statusCode = 400;
    res.json({message: 'You must be logged in!'})
}
