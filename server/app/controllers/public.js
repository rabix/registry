/**
 * Author: Milica Kadic
 * Date: 11/20/14
 * Time: 2:50 PM
 */
'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Revision = mongoose.model('Revision');

module.exports = function (app) {
    app.use('/', router);
};

/**
 * Get tool by id
 */
router.get('/tool/:id', function (req, res, next) {

    App.findById(req.params.id, function(err, app) {
        if (err) { return next(err); }

        if (app) {
            var json = _.isString(app.json) ? JSON.parse(app.json) : app.json;
            res.json(json);
        } else {
            res.status(400).json({message: 'This tool doesn\'t exist'});
        }
    });

});

/**
 * Get tool revision by id
 */
router.get('/tool-revision/:id', function (req, res, next) {

    Revision.findById(req.params.id, function(err, revision) {
        if (err) { return next(err); }

        if (revision) {
            var json = _.isString(revision.json) ? JSON.parse(revision.json) : revision.json;
            res.json(json);
        } else {
            res.status(400).json({message: 'This tool revision doesn\'t exist'});
        }
    });

});
