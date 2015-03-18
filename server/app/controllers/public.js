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
var PipelineRevision = mongoose.model('PipelineRevision');
var ToolValidator = require('../../tools/ToolValidator');

module.exports = function (app) {
    app.use('/', router);
};

/**
 * @apiDefine InvalidAppError
 * @apiError Message Invalid id
 * @apiErrorExample InvalidAppError:
 *     HTTP/1.1 404
 *     {
 *       "message": "There is no app with such id"
 *     }
 */

/**
 * Get public tool
 *
 * @apiName GetPublicTool
 * @api {GET} /tool/:id Get public tool by id
 *
 * @apiGroup Tools
 * @apiDescription Get public tool by id
 * @apiUse InvalidAppError
 *
 * @apiParam {Number} id Id of the tool
 * @apiSuccess {Object} json Json of the tool
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {json}
 */
router.get('/tool/:id', function (req, res, next) {

    App.findById(req.params.id, function(err, app) {
        if (err) { return next(err); }

        if (app) {
            var json = _.isString(app.json) ? JSON.parse(app.json) : app.json;
            res.json(json);
        } else {
            res.status(404).json({message: 'This tool doesn\'t exist'});
        }
    });

});

/**
 * Get public tool revision
 *
 * @apiName GetPublicToolRevision
 * @api {GET} /tool-revision/:id Get public tool revision by id
 *
 * @apiGroup Tools
 * @apiDescription Get public tool revision by id
 * @apiUse InvalidAppError
 *
 * @apiParam {Number} id Id of the tool revision
 * @apiSuccess {Object} json Json of the tool revision
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {json}
 */
router.get('/tool-revision/:id', function (req, res, next) {

    Revision.findById(req.params.id, function(err, revision) {
        if (err) { return next(err); }

        if (revision) {
            var json = _.isString(revision.json) ? JSON.parse(revision.json) : revision.json;
            res.json(json);
        } else {
            res.status(404).json({message: 'This tool revision doesn\'t exist'});
        }
    });

});

/**
 * Get public workflow revision
 *
 * @apiName GetPublicWorkflowRevision
 * @api {GET} /workflows/:revision Get public workflow revision by id
 *
 * @apiGroup Workflows
 * @apiDescription Get public workflow revision by id
 * @apiUse InvalidAppError
 *
 * @apiParam {Number} revision Id of the workflow revision
 * @apiSuccess {Object} json Json of the workflow
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {json}
 */
router.get('/workflow/:revision', function (req, res, next) {

    PipelineRevision.findById(req.params.revision, function(err, app) {
        if (err) { return next(err); }

        if (app) {
            var json = _.isString(app.json) ? JSON.parse(app.json) : app.json;
            res.json(json);
        } else {
            res.status(404).json({message: 'This workflow doesn\'t exist'});
        }
    });

});

router.post('/tools/validate', function (req, res, next) {

    var type = req.body.type || 'tool',
        json = req.body.json;

    var errors = ToolValidator.validate(type, json);

    res.json({errors: errors});

});