'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');

var Job = mongoose.model('Job');
var Repo = mongoose.model('Repo');

var Amazon = require('../../aws/aws').Amazon;
var filters = require('../../common/route-filters');

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Get all saved jobs
 */
router.get('/jobs', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};
    var regexp = new RegExp(req.query.q, 'i');

    if (req.user) {
        if (req.param('mine')) {
            where.user = req.user.id;
        } else {
            where.$or = [
                {user: req.user.id},
                {is_public: true}
            ];
        }
    } else {
        where.is_public = true;
    }

    Repo.find(where, function(err, repos) {

        if (err) { return next(err); }

        var whereJobs = {repo: {$in: _.pluck(repos, '_id')}};

        if (req.query.q) {
            whereJobs.$or = [
                {name: regexp},
                {author: regexp},
                {'json.app.@type': regexp}
            ];
        }

        Job.count(whereJobs).exec(function(err, total) {
            if (err) { return next(err); }

            Job.find(whereJobs)
                .populate('repo')
                .skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, jobs) {
                if (err) { return next(err); }

                res.json({list: jobs, total: total});
            });

        });

    });


});

/**
 * Create job and save it on s3 as well
 *
 * @post-param {object} json
 * @post-param {string} name
 * @post-param {string} repo
 */
router.post('/jobs', filters.authenticated, function (req, res, next) {

    var json = req.param('json');
    var name = req.param('name');
    var repo = req.param('repo');

    Job.count({name: name}).exec(function(err, count) {
        if (err) { return next(err); }

        if (count > 0) {
            res.status(400).json({message: 'The "' + name + '" job already exists, please choose another name!'});
        } else {

            var job = new Job();

            job.name = name;
            job.json = JSON.stringify(json);
            job.author = req.user.login;
            job.user = req.user.id;

            Repo.findById(repo).populate('user').exec(function (err, repo) {

                var user_id = req.user.id.toString();
                var repo_user_id = repo.user._id.toString();

                if (repo.is_public || user_id === repo_user_id) {

                    job.repo = repo._id;

                    var folder = 'users/' + req.user.login + '/jobs/' + repo.owner + '-' + repo.name;

                    Amazon.createFolder(folder)
                        .then(function() {
                            Amazon.uploadJSON(job.name + '.json', json, folder)
                                .then(function() {

                                    Amazon.getFileUrl(job.name + '.json', folder, function (url) {

                                        job.url = url;

                                        job.save(function() {
                                            res.json({url: url, message: 'Job has been successfully created'});
                                        });

                                    });
                                }, function (error) {
                                    res.status(500).json(error);
                                });
                        }, function(error) {
                            res.status(500).json(error);
                        });

                } else {
                    res.status(401).json({message: 'Unauthorized'});
                }
            });

        }
    });


});

/**
 * Delete job
 *
 * @param {String} id - id of the job
 * @return message
 */
router.delete('/jobs/:id', filters.authenticated, function (req, res, next) {

    Job.findById(req.params.id).populate('repo').exec(function (err, job) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var job_user_id = job.user.toString();

        if (user_id === job_user_id) {

            if (job.repo.is_public) {

                // TODO: allow app delete from public repo?

                res.status(400).json({message: 'This job belongs to public repo and it can\'t be deleted.'});

            } else {

                Job.remove({_id: req.params.id}, function (err) {
                    if (err) { return next(err); }

                    res.json({message: 'Job successfully deleted'});
                });

            }

        } else {
            res.status(500).json({message: 'Unauthorized'});
        }
    });

});

