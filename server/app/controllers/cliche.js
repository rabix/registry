'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');

module.exports = function (app, config) {
    app.use('/cliche', router);
};

router.get('/', function (req, res, next) {
    res.render(path.normalize('../../../../cliche/app/index.js'));
});

