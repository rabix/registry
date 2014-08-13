'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var _ = require('lodash');
var App = mongoose.model('App');
var Repo = mongoose.model('Repo');
var Build = mongoose.model('Build');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/', function (req, res, next) {
    res.json({message: 'Api is working!'});
});

