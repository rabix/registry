'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var App = mongoose.model('App');
var Revision = mongoose.model('Revision');
var Repo = mongoose.model('Repo');

var filters = require('../../common/route-filters');
var validator = require('../../common/validator');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/revisions', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
        if (paramKey === 'q') {
            where.$or = [
                {name:  new RegExp(paramVal, 'i')},
                {description:  new RegExp(paramVal, 'i')}
            ];
        }
    });

    App.findById(req.query.field_app_id).populate('repo').exec(function(err, app) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var app_user_id = app.user.toString();

        if (app.repo.is_public || user_id === app_user_id) {

            Revision.count(where).exec(function(err, total) {
                if (err) { return next(err); }

                Revision.find(where).skip(skip).limit(limit).sort({version: 'desc'}).exec(function(err, revisions) {
                    if (err) { return next(err); }

                    res.json({list: revisions, total: total});
                });

            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

router.get('/revisions/:id', function (req, res, next) {

    Revision.findById(req.params.id, function(err, revision) {
        if (err) { return next(err); }

        App.findById(revision.app_id).populate('repo').populate('user').exec(function(err, app) {
            if (err) { return next(err); }

            var user_id = (req.user ? req.user.id : '').toString();
            var app_user_id = app.user._id.toString();

            if (app.repo.is_public || user_id === app_user_id) {

                res.json({data: revision, repo: app.repo, user: app.user});

            } else {
                res.status(401).json({message: 'Unauthorized'});
            }

        });

    });

});


router.post('/revisions', filters.authenticated, function (req, res, next) {

    var data = req.body;

    var check = validator.validate(data.tool);

    if (!_.isEmpty(check.invalid) || !_.isEmpty(check.obsolete) || !_.isEmpty(check.required)) {
        res.status(400).json({message: 'There are some errors in your json scheme', json: check});
        return false;
    }

    App.findById(data.app_id, function(err, app) {

        var user_id = req.user.id.toString();
        var app_user_id = app.user.toString();

        if (user_id === app_user_id) {

            Revision.findOne({app_id: data.app_id}).sort({_id: 'desc'}).exec(function(err, r) {

                var revision = new Revision();

                revision.name = app.name;
                revision.description = data.tool.description;
                revision.author = data.tool.documentAuthor;
                revision.json = data.tool;
                revision.app_id = data.app_id;
                revision.version = r ? (r.version + 1) : 1;

                revision.save(function(err) {
                    if (err) { return next(err); }

                    app.revisions.push(revision._id);

                    app.json = revision.json;
                    app.description = revision.description;
                    app.author = revision.author;

                    app.save(function(err) {
                        if (err) { return next(err); }

                        res.json({revision: revision, message: 'Revision has been successfully created'});
                    });
                });
            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

router.delete('/revisions/:id', filters.authenticated, function (req, res, next) {

    Revision.findOne({_id: req.params.id}).populate('app_id').exec(function (err, revision) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var app_user_id = revision.app_id.user.toString();

        if (user_id === app_user_id) {

            Repo.findById(revision.app_id.repo, function(err, repo) {
                if (err) { return next(err); }

                if (repo.is_public) {

                    // TODO: allow revision delete from public repo?

                    res.status(403).json({message: 'This revision belongs to public repo and it can\'t be delete it'});

                } else {
                    Revision.remove({_id: req.params.id}, function (err) {
                        if (err) { return next(err); }

                        res.json({message: 'Revision successfully deleted'});

                    });
                }
            });

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }
    });

});


