'use strict';

var express = require('express');
var router = express.Router();

module.exports = function (app, config) {
    app.use('/api', router);
};

router.get('/', function (req, res, next) {
    res.json({message: 'Registry API v0.0.1'});
});


