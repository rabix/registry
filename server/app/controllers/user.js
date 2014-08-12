'use strict';

var express = require('express');
var router = express.Router();

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/user', function (req, res, next) {
    res.json({user: 'mock user'});
});
