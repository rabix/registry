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

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * @apiDefine InvalidIDError
 * @apiError Message Invalid id
 * @apiErrorExample InvalidIDError:
 *     HTTP/1.1 404
 *     {
 *       "message": "There is no item with such id"
 *     }
 */

/**
 * Get public tool
 *
 * @apiName GetPublicTool
 * @api {GET} /public/tool/:id Get public tool by id
 *
 * @apiGroup Tools
 * @apiDescription Get public tool by id
 * @apiUse InvalidIDError
 *
 * @apiParam {Number} id Id of the tool
 * @apiSuccess {Object} json Json of the tool
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {json}
 */
router.get('/public/tool/:id', function (req, res, next) {

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
 * @api {GET} /public/tool-revision/:id Get public tool revision by id
 *
 * @apiGroup Tools
 * @apiDescription Get public tool revision by id
 * @apiUse InvalidIDError
 *
 * @apiParam {Number} id Id of the tool revision
 * @apiSuccess {Object} json Json of the tool revision
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {json}
 */
router.get('/public/tool-revision/:id', function (req, res, next) {

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
 * @api {GET} /public/workflows/:revision Get public workflow revision by id
 *
 * @apiGroup Workflows
 * @apiDescription Get public workflow revision by id
 * @apiUse InvalidIDError
 *
 * @apiParam {Number} revision Id of the workflow revision
 * @apiSuccess {Object} json Json of the workflow
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {json}
 */
router.get('/public/workflow/:revision', function (req, res, next) {

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