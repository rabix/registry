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

router.get('/user/token', function (req, res, next) {
    User.find({});
    res.json({user: req.user});
});
