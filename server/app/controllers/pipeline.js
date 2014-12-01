'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('lodash');
var fs = require('fs');

var Pipeline = mongoose.model('Pipeline');
var PipelineRevision = mongoose.model('PipelineRevision');
var PipelineUrl = mongoose.model('PipelineUrl');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

var filters = require('../../common/route-filters');
var formater = require('../../pipeline/formater');
var validator = require('../../pipeline/validator');
var Amazon = require('../../aws/aws').Amazon;

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Format pipeline
 *
 * @post_param pipeline - Pipeline to format
 * @response json - Formated pipeline json
 */
router.post('/pipeline/format', function (req, res) {

    var p = formater.toRabixSchema(req.body.pipeline.json || req.body.pipeline);

    if (p.steps.length === 0) {
        res.status(400).json({message: 'Invalid pipeline'});
    } else {
        res.json({json: p});
    }

});

/**
 * Format pipeline json and upload it
 *
 * @post_param pipeline - Pipeline to upload
 * @response url - link to uploaded pipeline
 */
router.post('/pipeline/format/upload', function (req, res) {
    var p = req.body.pipeline;

    var folder, pipeline = formater.toRabixSchema(p.json);

    if (req.user) {
        folder = 'users/' + req.user.login + '/pipelines/' + p.name;
    } else {
        folder = 'others/pipelines';
    }

    var timeStamp = Date.now().toString();

    Amazon.createFolder(folder).then(
        function () {
            Amazon.uploadJSON(p.name + timeStamp + '.json', pipeline, folder).then(
                function () {

                    Amazon.getFileUrl(p.name + timeStamp + '.json', folder, function (u) {

                        if (req.user && req.user.id) {

                            var url = new PipelineUrl();

                            url.url = u;

                            url.pipeline_id = p._id;

                            url.user = req.user.id;

                            url.save();

                        }

                        res.json({url: u});

                    });

                }, function (error) {
                    res.status(500).json(error);
                });
        }, function (error) {
            res.status(500).json(error);
        });

});

/**
 * Get all pipelines
 */
router.get('/pipeline', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
    });

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

        var wherePipelines = {repo: {$in: _.pluck(repos, '_id')}};

        if (req.query.q) {
            wherePipelines.$or = [
                {name: new RegExp(req.query.q, 'i')},
                {description: new RegExp(req.query.q, 'i')}
            ];
        }

        Pipeline.count(wherePipelines, function(err, total) {
            if (err) { return next(err); }

            Pipeline.find(wherePipelines)
                .populate('repo')
                .populate('user', '_id email username')
                .populate('latest', 'name description')
                .populate({
                    path: 'revisions',
                    options: { limit: 25 },
                    sort: {
                        _id: 'desc'
                    }
                })
                .skip(skip)
                .limit(limit)
                .sort({_id: 'desc'})
                .exec(function(err, pipelines) {
                    if (err) { return next(err); }

                    res.json({list: pipelines, total: total});
                });

        });
    });

});

/**
 * Get specific pipeline
 *
 * @param :id Pipeline id
 */
router.get('/pipeline/:id', function (req, res, next) {


    Pipeline.findById(req.params.id).populate('repo').populate('user', '_id email username').populate('latest').exec(function(err, pipeline) {
        if (err) { return next(err); }

        if ( (req.user && pipeline.user._id === req.user.id) || pipeline.repo.is_public) {
            res.json({data: pipeline});
        } else {
            res.status(401).json({message: 'Unauthorized'});
        }

    });

});

/**
 * Create new pipeline
 *
 * @post_param data - Pipeline json
 */
router.post('/pipeline', filters.authenticated, function (req, res, next) {

    var data = req.body.data;

    Repo.findOne({_id: data.repo}, function (err, repo) {
        if (err) {return next(err);}

        if (repo) {

            Pipeline.findOne({name: data.name, repo: repo._id}, function (err, exists) {
                if (err) { return next(err);}

                if (!exists) {
                    var now = Date.now(),
                        stamp = {
                            created_on: now,
                            modified_on: now
                        };

                    var revision = new PipelineRevision();

                    revision.description = data.description;
                    revision.json = data.json;
                    revision.stamp = stamp;
                    revision.name = data.name;

                    revision.save();

                    var pipeline = new Pipeline();

                    pipeline.name = data.name;
                    pipeline.author = req.user.email;
                    pipeline.user = req.user.id;
                    pipeline.repo = data.repo;
                    pipeline.latest = revision._id;
                    pipeline.stamp = stamp;

                    pipeline.save(function(err) {
                        if (err) { return next(err); }

                        pipeline.revisions.push(revision._id);

                        revision.pipeline = pipeline._id;

                        pipeline.save(function () {
                            revision.save(function () {
                                res.json({message: 'Pipeline successfully added', id: revision._id});
                            });
                        });


                    });

                } else {
                    res.status(400).json({message: 'There is already a workflow with name: ' + data.name + ' in repo: ' + repo.name});
                }
            });

        } else {
            res.status(400).json({message: 'There is no repo with id: ' + data.repo });
        }
    });

});

/**
 * Update pipeline - create new revision
 *
 * @param :id Pipeline id
 */
router.put('/pipeline/:id', filters.authenticated, function (req, res, next) {

    var data = req.body.data;

    Pipeline.findById(req.params.id).populate('repo').populate('user').exec(function(err, pipeline) {
        if (err) { return next(err);}

        if (pipeline) {

            var p_u_id = pipeline.user._id.toString();

            if (req.user.id !== p_u_id) {
                res.status(401).json('Unauthorized');
                return false;
            }

            var revision = new PipelineRevision();

            revision.json = data.json;
            revision.name = data.name;
            revision.description = data.description;
            revision.pipeline = pipeline._id.toString();
            revision.version = pipeline.revisions.length + 1;

            revision.save(function (err, rev) {
                if (err) { return next(err);}

                pipeline.revisions.push(rev._id);
                pipeline.latest = rev._id;
                
                pipeline.save(function (err) {
                    if (err) { return next(err);}

                    res.json({id: revision._id, message: 'Successfully created new pipeline revision'});
                });

            });


        } else {
            res.status(404).json({message: 'There is no pipeline with id: '+ req.params.id});

        }
    });

});

/**
 * Delete workflow if it has only unpublished revisions
 *
 * @param :id Pipeline id
 */
router.delete('/pipeline/:id', filters.authenticated, function (req, res, next) {

    Pipeline.findOne({_id: req.params.id}).exec(function (err, pipeline) {
        if (err) { return next(err); }

        var user = req.user.id.toString();
        var app_user = pipeline.user.toString();

        if (user === app_user) {

            PipelineRevision.remove({pipeline: pipeline._id}, function (err) {
                if (err) { return next(err); }

                Pipeline.remove({_id: req.params.id}, function (err) {
                    if (err) { return next(err); }

                    res.json({message: 'Workflow successfully deleted'});

                });

            });

        } else {
            res.status(500).json({message: 'Unauthorized'});
        }


    });

});

/**
 * Fork existing pipeline
 *
 * @post_param pipeline - Pipeline json to fork
 */
router.post('/pipeline/fork', filters.authenticated, function (req, res, next) {

    var pipeline_to_fork = req.body.pipeline;

    Repo.findOne({_id: pipeline_to_fork.repo, user: req.user.id }).populate('repo').populate('user', '_id email username').exec(function (err, repo) {
        if (err) {return next(err);}

        if (repo) {

            Pipeline.findOne({name: pipeline_to_fork.name, repo: repo._id}, function (err, exists) {
                if (err) {return next(err);}

                if (!exists) {

                    var now = Date.now(),
                        stamp = {
                            created_on: now,
                            modified_on: now
                        };

                    var revision = new PipelineRevision();

                    revision.description = pipeline_to_fork.description;
                    revision.json = pipeline_to_fork.json;
                    revision.stamp = stamp;
                    revision.name = pipeline_to_fork.name;

                    revision.save();

                    var pipeline = new Pipeline();

                    pipeline.name = pipeline_to_fork.name;
                    pipeline.author = req.user.email;
                    pipeline.user = req.user.id;
                    pipeline.repo = repo._id;
                    pipeline.latest = revision._id;
                    pipeline.stamp = stamp;

                    pipeline.save(function(err) {
                        if (err) { return next(err); }

                        pipeline.revisions.push(revision._id);

                        revision.pipeline = pipeline._id;

                        revision.save();
                        pipeline.save();

                        res.json({message: 'Pipeline successfully added', id: revision._id});

                    });

                } else {
                    res.status(400).json({message: 'There is already a workflow with name: "' + pipeline_to_fork.name + '" in repo: "' + repo.name + '"'});
                }
            });

        } else {
            res.status(400).json({message: 'There is no repo with id: ' + pipeline_to_fork.repo });
        }

    });

});

/**
 * Get all pipeline revisions
 */
router.get('/pipeline-revisions', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
        if (paramKey === 'q') {
            where.$or = [
                {name: new RegExp(paramVal, 'i')},
                {description: new RegExp(paramVal, 'i')}
            ];
        }
    });

    Pipeline.findById(req.query.field_pipeline)
        .populate('repo')
        .populate('revisions')
        .populate('latest')
        .populate('user')
        .exec(function(err, pipeline) {

            if (err) { return next(err); }

            if ((pipeline.repo.is_public) || ( req.user && req.user.id === pipeline.user._id.toString()) ) {

                where.pipeline = pipeline._id;

                PipelineRevision.count(where).exec(function(err, total) {
                    if (err) { return next(err); }

                    var sort = req.user ? {_id: 'desc'} : {version: 'desc'};

                    PipelineRevision.find(where).skip(skip).limit(limit).sort(sort).exec(function(err, revisions) {
                        if (err) { return next(err); }

                        res.json({list: revisions, total: total});
                    });

                });

            } else {
                res.status(401).json({message: 'Unauthorized, repository that this workflow belongs to is not public'});
            }

    });

});

/**
 * Get Pipeline revision by id
 *
 * @param :id Revision id
 */
router.get('/pipeline-revisions/:id', function (req, res, next) {
    console.log('Rev id: ',req.params.id);
    PipelineRevision.findById(req.params.id).populate('pipeline').exec(function(err, pipeline) {
        if (err) { return next(err); }

        Repo.populate(pipeline, 'pipeline.repo', function (err, p) {

            User.populate(p, {
                path: 'pipeline.user',
                select:  '_id email username'
            }, function (err, pipe) {
//                console.log('Pipeline populated: ', pipe.pipeline.user,  req.user.id === pipe.pipeline.user._id.toString());
                console.log('pipe', pipe, pipeline);
                var repo_public = p.pipeline.repo.is_public;

                if (repo_public || (req.user && req.user.id === pipe.pipeline.user._id.toString() )) {
                    res.json({data: pipe});
                } else {
                    res.status(401).json({message: 'Unauthorized, repository that this workflow belongs to is not public'});
                }
            });

        });
    });

});

/**
 * Updates pipeline revisions
 *
 * @Depricated, dropped publishing on revision level
 *
 * @param :revision Revision id
 */
router.put('/pipeline-revisions/:revision', filters.authenticated, function (req, res, next) {
    var revision_id = req.params.revision,
        isPublic = true;

    PipelineRevision.findOneAndUpdate({_id: revision_id }, {is_public: isPublic}, function (err, revision) {
        if (err) { return next(err);}

        PipelineRevision.count({pipeline: revision.pipeline, is_public: true}, function (err, total) {
            if (err) { return next(err);}

            revision.version = total;

            revision.save(function () {

                Pipeline.findOne({_id: revision.pipeline}, function (err, pipe) {

                    if (err) { return next(err);}

                    pipe.latest_public = revision_id;

                    pipe.save(function () {

                        if (err) { return next(err);}

                        res.json({message: 'Revision successfully published'});
                    });

                });

            });


        });

    });
});

/**
 * Delete pipeline revision
 *
 * @param :revision - reivison id
 */
router.delete('/pipeline-revisions/:revision', filters.authenticated, function (req, res, next) {
    var revision_id = req.params.revision;

    PipelineRevision.findById(revision_id).populate('pipeline').exec(function (err, revision) {

        User.populate(revision, {
            path: 'pipeline.user',
            select:  '_id email username'
        }, function (err, rev) {
            if (err) { return next(err); }

            if (!rev.is_public && rev.pipeline.user._id.toString() === req.user.id) {

                var pipeline_id = rev.pipeline._id;
                Pipeline.findById(pipeline_id, function (err, pipeline) {
                    if (err) {return next(err);}

                    if (pipeline.revisions.length > 1) {

                        PipelineRevision.remove({_id: revision_id}, function (err) {
                            if (err) {return next(err);}

                            var index = pipeline.revisions.indexOf(revision_id);

                            pipeline.revisions.splice(index, 1);

                            pipeline.latest = pipeline.revisions[pipeline.revisions.length - 1];

                            pipeline.save(function () {
                                res.json({message: 'Successfully deleted workflow revision', latest: pipeline.latest});
                            });

                        });

                    } else {
                        res.status(403).json({message: 'Last workflow revision cannot be deleted'});
                    }

                });

            } else {
                res.status(403).json({message: 'Workflow revision cannot be deleted - Forbidden'});
            }

        });
    });

});


router.get('/workflow/repositories/:type', function (req, res, next) {

    var type = req.params.type;
    var where = {};
    var match = {};

    if (type === 'my') {
        if (!req.user) {
            res.json({message: 'Log in to see your repositories'});
            return false;
        }

        where.user = req.user.id;
    } else {
        if (req.user) {
            where.user = {$ne: req.user.id};
        }
        match.$or = [];
        match.$or.push({
            is_public: true
        });
    }

    Pipeline.find(where)
        .populate('repo')
        .populate('user', '_id email username')
        .populate('latest')
        .populate({
            path: 'revisions',
            match: match
        })
        .sort({_id: 'desc'})
        .exec(function (err, pipelines) {
            if (err) { return next(err);}

            var grouped = _.groupBy(pipelines, function (p) {
                return p.repo.owner + '/' + p.repo.name;
            });

            res.json({list: grouped});
        });

});

router.get('/validator', function (req, res, next) {
//    var id = '547859f5a04fe50000fe5cc7';
    var id = '547c3946a83161fd3d0084f7';

    PipelineRevision.findOne({_id: id}, function (err, rev) {
        if (err) {return next(err);}

        var errors = validator.validate(rev.json);

        res.json({errors: errors, json: rev.json.relations});
    });
});