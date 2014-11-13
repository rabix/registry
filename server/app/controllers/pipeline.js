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
var Amazon = require('../../aws/aws').Amazon;

var raw_pipeline_model = {
    stamp: {
        created_by: '',
        created_on: '',
        modified_by: '',
        modified_on: ''
    },
    display: {
        canvas: {
            x: 0,
            y: 0,
            zoom: 1
        },
        description: '',
        name: '',
        nodes: {}
    },
    nodes: [],
    relations: [],
    schemas: []
};

var packed_raw_pipeline_model = {
    stamp: {
        created_by: '',
        created_on: '',
        modified_by: '',
        modified_on: ''
    },
    display: {
        canvas: {
            x: 0,
            y: 0,
            zoom: 1
        },
        description: '',
        name: '',
        nodes: {}
    },
    // realtions -> steps
    steps: [],
    // nodes -> apps
    apps: {},
    // inputs from relations -> inputs (remove relations)
    inputs: {},
    // outputs from relations -> outputs (remove relations)
    outputs: {}
};


module.exports = function (app) {
    app.use('/api', router);
};

router.post('/pipeline/format', function (req, res, next) {

    var p = formater.toRabixSchema(req.body.pipeline.json || req.body.pipeline);

    if (p.steps.length === 0) {
        res.status(400).json({message: "Invalid pipeline"});
    } else {
        res.json({json: p});
    }

});

router.post('/pipeline/format/upload', function (req, res, next) {
    var p = req.body.pipeline;

    var folder, pipeline = formater.toRabixSchema(p.json);

    if (req.user) {
        folder = 'users/' + req.user.login + '/pipelines/' + p.name;
    } else {
        folder = 'others/pipelines';
    }

    var timeStamp = Date.now();

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

router.get('/pipeline', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
//        if (paramKey === 'q') {
//            where.$or = [
//                {name: new RegExp(paramVal, 'i')},
//                {description: new RegExp(paramVal, 'i')}
//            ];
//        }
    });

    if (req.user && req.param('mine')) {
        where.user = req.user.id;
    }

//    PipelineRevision.count(where).exec(function(err, total) {
//        if (err) { return next(err); }
//
//        PipelineRevision.find(where).populate('pipeline').skip(skip).limit(limit).exec(function(err, pipelines) {
//            if (err) { return next(err); }
//
//            Repo.populate(pipelines, 'pipeline.repo', function (err, p) {
//                User.populate(p, {
//                    path: 'pipeline.user',
//                    select:  '_id email username'
//                }, function (err, pipes) {
//                    res.json({list: pipes, total: total});
//                });
//
//            });
//        });
//
//    });

    Pipeline.count(where).exec(function(err, total) {
        if (err) { return next(err); }

        var match = {is_public: true};

        if (req.query.q) {
            match.$or = [
                {name: new RegExp(req.query.q, 'i')},
                {description: new RegExp(req.query.q, 'i')}
            ];
        }

        Pipeline.find(where)
            .populate('repo')
            .populate('user', '_id email username')
            .populate('latest', 'name description')
            .populate({
                path: 'revisions',
                select: 'name description version',
                match: match,
                options: { limit: 25 }
            })
            .skip(skip)
            .limit(limit)
            .sort({_id: 'desc'})
            .exec(function(err, apps) {
                if (err) { return next(err); }

                res.json({list: apps, total: total});
            });

    });
});

router.get('/pipeline/:id', function (req, res, next) {

    Pipeline.findById(req.params.id).populate('repo').populate('user', '_id email username').populate('latest').exec(function(err, pipeline) {
        if (err) { return next(err); }

        res.json({data: pipeline});
    });

});

router.get('/pipeline-revisions/:id', function (req, res, next) {
    console.log('Rev id: ',req.params.id);
    PipelineRevision.findById(req.params.id).populate('pipeline').exec(function(err, pipeline) {
        if (err) { return next(err); }

        Repo.populate(pipeline, 'pipeline.repo', function (err, p) {

            User.populate(p, {
                path: 'pipeline.user',
                select:  '_id email username'
            }, function (err, pipe) {

                res.json({data: pipe});

            });

        });
    });

});

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
    

    Pipeline.findById(req.query.field_pipeline, function(err, pipeline) {
        if (err) { return next(err); }

        var user_id = (req.user ? req.user.id : '').toString();
        var pipeline_user_id = pipeline.user.toString();

        if (user_id !== pipeline_user_id) {
            where.is_public = true;
        }

        PipelineRevision.count(where).exec(function(err, total) {
            if (err) { return next(err); }

            PipelineRevision.find(where).skip(skip).limit(limit).sort({_id: 'desc'}).exec(function(err, revisions) {
                if (err) { return next(err); }

                res.json({list: revisions, total: total});
            });

        });

    });


});

router.post('/pipeline', filters.authenticated, function (req, res, next) {

    var data = req.body.data;
    
    Repo.findOne({_id: data.repo}, function (err, repo) {
        if (err) {return next(err);}

        if (repo) {
            var now = Date.now(),
                stamp = {
                created_on: now,
                modified_on: now
            };

            var revision = new PipelineRevision();

            revision.name = data.name;
            revision.description = data.description;
            revision.json = data.json;
            revision.stamp = stamp;

            revision.save();

            var pipeline = new Pipeline();

            pipeline.author = req.user.email;
            pipeline.user = req.user.id;
            pipeline.repo = data.repo;
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
            res.status(400).json({message: 'There is no repo with id: ' + data.repo });
        }
    });

});

router.put('/pipeline/:id', filters.authenticated, function (req, res, next) {

    var data = req.body.data;

    Pipeline.findById(req.params.id).populate('repo').populate('user').exec(function(err, pipeline) {
        if (err) {
            return next(err);
        }



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

            revision.save(function (err, rev) {
                if (err) {
                    return next(err);
                }

                pipeline.revisions.push(rev._id);
                pipeline.save();

                res.json({id: revision._id, message: 'Successfully created new pipeline revision'});
            });


        } else {
            res.status(404).json({message: 'There is no pipeline with id: '+ req.params.id});

        }
    });

});

router.put('/pipeline-revisions/:revision', filters.authenticated, function (req, res, next) {
    var revision_id = req.params.revision,
        isPublic = true;

        PipelineRevision.findOneAndUpdate({_id: revision_id }, {is_public: isPublic}, function (err, revision) {
            if (err) {
                return next(err);
            }

            PipelineRevision.count({pipeline: revision.pipeline, is_public: true}, function (err, total) {
                if (err) {
                    return next(err);
                }

                revision.version = total;

                revision.save(function () {

                    Pipeline.populate(revision, 'rev.pipeline', function (err, rev) {

                        if (err) {
                            return next(err);
                        }

                        Pipeline.findOneAndUpdate({_id: rev.pipeline._id}, {latest: revision_id}, function (err) {

                            if (err) {
                                return next(err);
                            }

                            res.json({message: 'Revision successfully ' + isPublic ? 'published' : 'unpublished'});
                        });

                    });

                });


            });

        });
});

router.delete('/pipeline-revisions/:revision', filters.authenticated, function (req, res, next) {
    var pipeline_id = req.params.id,
        revision_id = req.params.revision;


});

router.delete('/pipeline/:id', filters.authenticated, function (req, res, next) {

    Pipeline.findOne({_id: req.params.id}).exec(function (err, pipeline) {
        if (err) { return next(err); }

        var user = req.user.id.toString();
        var app_user = pipeline.user.toString();

        if (user === app_user) {
            Pipeline.remove({_id: req.params.id}, function (err) {
                if (err) { return next(err); }

                res.json({message: 'Pipeline successfully deleted'});

            });
        } else {
            res.status(500).json({message: 'Unauthorized'});
        }
    });


});

router.post('/pipeline/fork', filters.authenticated, function (req, res, next) {

    var pipeline_to_fork = req.body.pipeline;

    Repo.findOne({_id: pipeline_to_fork.repo}).populate('repo').populate('user', '_id email username').exec(function (err, repo) {
        if (err) {return next(err);}

        if (repo) {

//            var p = new Pipeline();
//
//            p.json = pipeline.json;
//            p.user = req.user.id;
//            p.author = pipeline.author;
//
//            p.description = pipeline.description;
//            p.name = pipeline.name;
//            p.repo = pipeline.repo;
//
//            p.save();
//
//            res.json({
//                _id: p._id,
//                message: 'Pipeline successfully updated'
//            });

            var now = Date.now(),
                stamp = {
                    created_on: now,
                    modified_on: now
                };

            var revision = new PipelineRevision();

            revision.name = pipeline_to_fork.name;
            revision.description = pipeline_to_fork.description;
            revision.json = pipeline_to_fork.json;
            revision.stamp = stamp;

            revision.save();

            var pipeline = new Pipeline();

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
            res.status(400).json({message: 'There is no repo with id: ' + pipeline.repo });
        }

    });



});


