'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('Pipeline');

var filters = require('../../common/route-filters');
var validator = require('../../common/validator');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};


router.get('/pipeline/format', function (req, res, next) {

});

