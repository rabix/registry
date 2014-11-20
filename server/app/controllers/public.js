/**
 * Author: Milica Kadic
 * Date: 11/20/14
 * Time: 2:50 PM
 */
'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var App = mongoose.model('App');
var Revision = mongoose.model('Revision');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tool/:id', function (req, res, next) {

    App.findById(req.params.id, function(err, app) {
        if (err) { return next(err); }

        if (app) {
            res.json(app.json);
        } else {
            res.status(400).json({message: 'This tool doesn\'t exist'});
        }
    });

});

router.get('/tool-revision/:id', function (req, res, next) {

    Revision.findById(req.params.id, function(err, revision) {
        if (err) { return next(err); }

        if (revision) {
            res.json(revision.json);
        } else {
            res.status(400).json({message: 'This tool revision doesn\'t exist'});
        }
    });

});
