'use strict';

var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Subscriber = mongoose.model('Subscriber');
var filters = require('../../common/route-filters');

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Get user details
 *
 * @apiName GetUser
 * @api {GET} /api/user Get user details
 * @apiGroup Users
 * @apiDescription Fetch user details
 *
 * @apiSuccess {Object} user User details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": "{user}",
 *     }
 */
router.get('/user', filters.authenticated, function (req, res, next) {

    res.json({user: req.user});

});

/**
 * Get user's token
 *
 * @apiName GetUserToken
 * @api {GET} /api/user/token Get user's token
 * @apiGroup Users
 * @apiPermission Logged in user
 * @apiDescription Fetch user's token
 *
 * @apiSuccess {String} token User's token
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "{token}",
 *     }
 */
router.get('/user/token', filters.authenticated, function (req, res, next) {

    User.findOne({email: req.user.email}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

/**
 * Generate token for the user
 *
 * @apiName GenerateUserToken
 * @api {PUT} /api/user/token Generate token for the user
 * @apiGroup Users
 * @apiPermission Logged in user
 * @apiDescription Generate token for the user
 *
 * @apiSuccess {String} token User's token
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "{token}",
 *     }
 */
router.put('/user/token', filters.authenticated, function (req, res, next) {

    var token = uuid.v4();

    User.findOneAndUpdate({email: req.user.email}, {token: token}, {}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

/**
 * Revoke user's token
 *
 * @apiName RevokeUserToken
 * @api {DELETE} /api/user/token Revoke user's token
 * @apiGroup Users
 * @apiPermission Logged in user
 * @apiDescription Revoke user's token
 *
 * @apiSuccess {String} token User's token
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "{token}",
 *     }
 */
router.delete('/user/token', filters.authenticated, function (req, res, next) {

    User.findOneAndUpdate({email: req.user.email}, {token: ''}, {}, function(err, user) {
        if (err) { return next(err); }

        res.json({token: user.token});
    });

});

/**
 * Subscribe to the Rabix list
 *
 * @apiName SubscribeUser
 * @api {POST} /api/subscribe Subscribe to the Rabix list
 * @apiParam {String} email Email of the subscriber
 * @apiGroup Users
 * @apiDescription Subscribe to the Rabix list
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */
router.post('/subscribe', function (req, res, next) {

    var email = req.param('email');

    Subscriber.findOne({email: email}, function(err, item) {
        if (err) { return next(err); }

        if (!item) {
            var subscriber = new Subscriber();
            subscriber.email = email;
            subscriber.save();
        }

        res.end();
    });

});
