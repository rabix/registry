'use strict';

var express = require('express');
var router = express.Router();

module.exports = function (app, config) {
    app.use('/api', router);
};

router.get('/', function (req, res, next) {
    res.json({message: 'Api is working!'});
});w


