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
 * Get all jobs
 *
 * @apiName GetJobs
 * @api {GET} /api/jobs Get all jobs
 * @apiGroup Repos
 * @apiDescription Fetch all jobs
 *
 * @apiSuccess {Number} total Total number of jobs
 * @apiSuccess {Array} list List of jobs
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "total": "1",
 *       "list": [{job}]
 *     }
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

        if (req.query.type) { whereJobs.type = req.query.type; }
        if (req.query.type && req.query.ref) {
            if (req.query.type === 'Workflow') {
                whereJobs.workflow = req.query.ref;
            } else {
                whereJobs.tool = req.query.ref;
            }
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
 * Get job by id
 *
 * @apiName GetJob
 * @api {GET} /jobs/:id Get job by id
 * @apiParam {String} id ID of the job
 * @apiGroup Jobs
 * @apiDescription Get job by id
 * @apiUse UnauthorizedError
 *
 * @apiSuccess {Object} data Job details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {job}
 *     }
 */
router.get('/jobs/:id', function (req, res, next) {

    Job.findById(req.params.id).populate('user').populate('repo').exec(function(err, job) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var job_user_id = job.user._id.toString();

        if (job.repo.is_public || user_id === job_user_id) {

            job.json = _.isObject(job.json) ? job.json : JSON.parse(job.json);

            res.json({data: job});

        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 * Update existing job
 *
 * @apiName UpdateJob
 * @api {PUT} /jobs/:id Update job by id
 * @apiParam {String} id ID of the job
 * @apiGroup Jobs
 * @apiDescription Update existing job by id
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 * @apiUse NameCollisionError
 *
 * @apiSuccess {String} message Success message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Job has been successfully updated"
 *     }
 */
router.put('/jobs/:id', filters.authenticated, function (req, res, next) {

    var j = req.param('job');

    Job.findById(req.params.id).populate('user').populate('repo').exec(function(err, job) {
        if (err) { return next(err); }

        var user_id = req.user.id.toString();
        var repo_user_id = job.repo.user.toString();

        if (job.repo.is_public || user_id === repo_user_id) {
            Job.findOne({name: j.name, _id: {$ne: req.params.id}}, function (err, check) {
                if (err) { return next(err); }

                if (!check) {

                    job.name = j.name;
                    job.json = JSON.stringify(j.json);

                    var folder = 'users/' + req.user.login + '/jobs/' + job.repo.owner + '-' + job.repo.name;

                    Amazon.createFolder(folder)
                        .then(function() {
                            Amazon.uploadJSON(job.name + '.json', j.json, folder)
                                .then(function() {

                                    Amazon.getFileUrl(job.name + '.json', folder, function (url) {

                                        job.url = url;

                                        job.save(function() {
                                            res.json({url: url, message: 'Task has been successfully updated'});
                                        });

                                    });
                                }, function (error) {
                                    res.status(500).json(error);
                                });
                        }, function(error) {
                            res.status(500).json(error);
                        });

                } else {
                    res.status(400).json({message: 'Task name already in use'});
                }
            });
        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 * Create new job
 *
 * @apiName CreateJob
 * @api {POST} /jobs Create new job
 * @apiGroup Jobs
 * @apiDescription Create new job
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 * @apiUse NameCollisionError
 *
 * @apiSuccess {String} message Success message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Job has been successfully created"
 *     }
 */
router.post('/jobs', filters.authenticated, function (req, res, next) {

    var j = req.param('job');

    Job.count({name: j.name}, function(err, count) {
        if (err) { return next(err); }

        if (count > 0) {
            res.status(400).json({message: 'The "' + name + '" task already exists, please choose another name!'});
        } else {

            var job = new Job();

            job.name = j.name;
            job.type = j.type;
            job.json = JSON.stringify(j.json);
            job.author = req.user.login;
            job.user = req.user.id;
            if (j.type === 'Workflow') { job.workflow = j.ref; } else { job.tool = j.ref; }

            Repo.findById(j.repo).populate('user').exec(function (err, repo) {
                if (err) { return next(err); }

                var user_id = req.user.id.toString();
                var repo_user_id = repo.user._id.toString();

                if (repo.is_public || user_id === repo_user_id) {

                    job.repo = repo._id;

                    var folder = 'users/' + req.user.login + '/jobs/' + repo.owner + '-' + repo.name;

                    Amazon.createFolder(folder)
                        .then(function() {
                            Amazon.uploadJSON(job.name + '.json', j.json, folder)
                                .then(function() {

                                    Amazon.getFileUrl(job.name + '.json', folder, function (url) {

                                        job.url = url;

                                        job.save(function() {
                                            res.json({id: job._id, url: url, message: 'Task has been successfully created'});
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
/**
 *
 * Delete job by id
 *
 * @apiName DeleteJob
 * @api {DELETE} /api/jobs/:id Delete job by id
 * @apiGroup Jobs
 * @apiDescription Delete job by id
 * @apiPermission Logged in user
 * @apiUse UnauthorizedError
 *
 * @apiError message Forbidden job delete from the public repo
 * @apiErrorExample {json} PublicRepoError:
 *     HTTP/1.1 403 Bad Request
 *     {
 *       "message": "This job belongs to public repo and it can't be deleted."
 *     }
 *
 * @apiSuccess {String} message Success message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "message": "Job successfully deleted"
 *     }
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

