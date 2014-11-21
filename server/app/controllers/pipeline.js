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

router.get('/pipeline', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;
    var where = {};

    _.each(req.query, function(paramVal, paramKey) {
        if (_.contains(paramKey, 'field_')) {
            where[paramKey.replace('field_', '')] = paramVal;
        }
    });

    if (req.user && req.param('mine')) {
        where.user = req.user.id;
    }


    Pipeline.count(where, function(err, total) {
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

                        revision.save();
                        pipeline.save();

                        res.json({message: 'Pipeline successfully added', id: revision._id});

                    });

                } else {
                    res.status(400).json({message: 'There is already a workflow with name: ' + data.name + ' in repo: ' + repo.name});
                }
            })

        } else {
            res.status(400).json({message: 'There is no repo with id: ' + data.repo });
        }
    });

});

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
            revision.rev = pipeline.revisions.length + 1;

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
 */
router.delete('/pipeline/:id', filters.authenticated, function (req, res, next) {

    Pipeline.findOne({_id: req.params.id}).exec(function (err, pipeline) {
        if (err) { return next(err); }

        var user = req.user.id.toString();
        var app_user = pipeline.user.toString();

        if (user === app_user) {

            PipelineRevision.find({pipeline: pipeline._id, is_public: true}, function (err, revs) {
                if (err) { return next(err); }

                if (revs && revs.length === 0) {

                    PipelineRevision.remove({pipeline: pipeline._id}, function (err) {
                        if (err) { return next(err); }

                        Pipeline.remove({_id: req.params.id}, function (err) {
                            if (err) { return next(err); }

                            res.json({message: 'Workflow successfully deleted'});

                        });


                    });

                } else {
                    res.status(403).json({message: 'Workflow cannot be deleted, it has published revisions'});
                }

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
            })

        } else {
            res.status(400).json({message: 'There is no repo with id: ' + pipeline.repo });
        }

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
                                res.json({message: 'Successfully deleted workflow revision', latest: pipeline.latest})
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

router.get('/test/test', function (req, res, next) {

    var test_pipeline = {
        "schemas" : {
            "Input_1_1" : {
                "id" : "Input_1_1",
                "outputs" : {
                    "properties" : {
                        "input_1" : {
                            "type" : "file",
                            "required" : false,
                            "id" : "input_1",
                            "name" : "Input_1"
                        }
                    },
                    "type" : "object"
                },
                "inputs" : {
                    "type" : "object"
                },
                "documentAuthor" : null,
                "softwareDescription" : {
                    "name" : "Input_1",
                    "repo_name" : "system",
                    "repo_owner" : "rabix"
                }
            },
            "shism_1" : {
                "order" : 2,
                "is_public" : true,
                "version" : 2,
                "json" : {
                    "adapter" : {
                        "args" : [
                            {
                                "value" : "mem",
                                "order" : 0
                            },
                            {
                                "value" : 10,
                                "prefix" : "-t",
                                "order" : 1
                            }
                        ],
                        "stdout" : "output.sam",
                        "baseCmd" : [
                            "bwa"
                        ]
                    },
                    "outputs" : {
                        "properties" : {
                            "sam" : {
                                "adapter" : {
                                    "secondaryFiles" : [ ],
                                    "meta" : {
                                        "key2" : "test",
                                        "key1" : {
                                            "expr" : "$job"
                                        },
                                        "__inherit__" : ""
                                    },
                                    "glob" : "output.sam",
                                    "streamable" : true
                                },
                                "type" : "file"
                            }
                        },
                        "type" : "object"
                    },
                    "inputs" : {
                        "properties" : {
                            "min_std_max_min" : {
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "prefix" : "-I",
                                    "order" : 1
                                },
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 4,
                                "minItems" : 1,
                                "type" : "array"
                            },
                            "minimum_seed_length" : {
                                "adapter" : {
                                    "separator" : "_",
                                    "prefix" : "-m",
                                    "order" : 1
                                },
                                "type" : "integer"
                            },
                            "reads" : {
                                "adapter" : {
                                    "listStreamable" : true,
                                    "order" : 3
                                },
                                "items" : {
                                    "type" : "file"
                                },
                                "required" : true,
                                "maxItems" : 2,
                                "minItems" : 1,
                                "type" : "array"
                            },
                            "reference" : {
                                "adapter" : {
                                    "order" : 2
                                },
                                "required" : true,
                                "type" : "file"
                            }
                        },
                        "type" : "object"
                    },
                    "requirements" : {
                        "resources" : {
                            "network" : false,
                            "diskSpace" : 0,
                            "ports" : [ ],
                            "mem" : 5000,
                            "cpu" : 0
                        },
                        "environment" : {
                            "container" : {
                                "imageId" : "test",
                                "uri" : "test",
                                "type" : "docker"
                            }
                        }
                    },
                    "documentAuthor" : "milica.kadic.87@gmail.com",
                    "softwareDescription" : {
                        "repo_name" : "test",
                        "description" : "lorem",
                        "name" : "shism",
                        "repo_owner" : "milica"
                    }
                },
                "description" : "lorem",
                "author" : "milica.kadic.87@gmail.com",
                "app_id" : "546a1e223c384469484f0a15",
                "_id" : "546a1e933c384469484f0a17",
                "__v" : 0
            },
            "Output_1_1" : {
                "id" : "Output_1_1",
                "outputs" : {
                    "type" : "object"
                },
                "inputs" : {
                    "properties" : {
                        "output_1" : {
                            "type" : "file",
                            "required" : false,
                            "id" : "output_1",
                            "name" : "Output_1"
                        }
                    },
                    "type" : "object"
                },
                "documentAuthor" : null,
                "softwareDescription" : {
                    "name" : "Output_1",
                    "repo_name" : "system",
                    "repo_owner" : "rabix"
                }
            },
            "BWA MEM_1" : {
                "order" : 1,
                "is_public" : true,
                "version" : 1,
                "json" : {
                    "adapter" : {
                        "args" : [
                            {
                                "value" : "mem",
                                "order" : 0
                            },
                            {
                                "value" : {
                                    "expr" : {
                                        "lang" : "javascript",
                                        "value" : "$job['allocatedResources']['cpu']"
                                    }
                                },
                                "prefix" : "-t",
                                "order" : 1
                            }
                        ],
                        "stdout" : "output.sam",
                        "baseCmd" : [
                            "bwa"
                        ]
                    },
                    "outputs" : {
                        "properties" : {
                            "sam" : {
                                "adapter" : {
                                    "secondaryFiles" : [ ],
                                    "meta" : {
                                        "__inherit__" : "reads",
                                        "file_type" : "sam"
                                    },
                                    "glob" : "output.sam",
                                    "streamable" : true
                                },
                                "type" : "file"
                            }
                        },
                        "type" : "object"
                    },
                    "inputs" : {
                        "properties" : {
                            "mark_shorter_split_hits_as_secondary" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-M",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "use_soft_clipping_for_supplementary_alignments" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-Y",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "append_FASTA/FASTQ_comment_to_SAM_output" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-C",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "output_all_alignments_for_SE_or_unpaired_PE" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-a",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "if_there_are_<INT_hits_with_score>80%_of_the_max_score,output_all_in_XA" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 0,
                                    "prefix" : "-h",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "minimum_score_to_output" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-T",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "read_group_header_line" : {
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-R",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "first_query_file_consists_of_interleaved_paired-end_sequences" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-p",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "read_type_Setting_-x_changes_multiple_parameters_unless_overriden" : {
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-x",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "penalty_for_an_unpaired_read_pair" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-U",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "penalty_for_5'-and_3'-end_clipping" : {
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 2,
                                "minItems" : 1,
                                "required" : false,
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "order" : 1,
                                    "prefix" : "-L",
                                    "separator" : "_"
                                },
                                "type" : "array"
                            },
                            "gap_extension_penalty;a_gap_of_size_k_cost_{-O}+{-E}*k'" : {
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 2,
                                "minItems" : 1,
                                "required" : false,
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "order" : 1,
                                    "prefix" : "-E",
                                    "separator" : "_"
                                },
                                "type" : "array"
                            },
                            "gap_open_penalties_for_deletions_and_insertions" : {
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 2,
                                "minItems" : 1,
                                "required" : false,
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "order" : 1,
                                    "prefix" : "-O",
                                    "separator" : "_"
                                },
                                "type" : "array"
                            },
                            "penalty_for_a_mismatch" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-B",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "score_for_a_sequence_match,which_scales_options_-TdBOELU_unless_overridden" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-A",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "discard_full-length_exact_matches" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-e",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "skip_pairing;mate_rescue_performed_unless_-S_also_in_use" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-P",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "skip_mate_rescue" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-S",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "discard_a_chain_if_seeded_bases_shorter_than_ INT" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-W",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "look_for_internal_seeds_inside_a_seed_longer_than_k*1_5" : {
                                "enum" : null,
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-r",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "perform_at_most_INT_rounds_of_mate_rescues_for_each_read" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-m",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "drop_chains_shorter_than_FLOAT_fraction_of_the_longest_overlapping_chain" : {
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-D",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "skip_seeds_with_more_than_INT_occurrences" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-c",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "off-diagonal_X-dropoff" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-d",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "band_width_for_banded_alignment" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-w",
                                    "separator" : ""
                                },
                                "type" : "integer"
                            },
                            "min_std_max_min" : {
                                "adapter" : {
                                    "separator" : "_",
                                    "prefix" : "",
                                    "order" : 1
                                },
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 4,
                                "minItems" : 1,
                                "type" : "array"
                            },
                            "minimum_seed_length" : {
                                "adapter" : {
                                    "separator" : "_",
                                    "prefix" : "-k",
                                    "order" : 1
                                },
                                "type" : "integer"
                            },
                            "reads" : {
                                "adapter" : {
                                    "listStreamable" : true,
                                    "order" : 3
                                },
                                "items" : {
                                    "type" : "file"
                                },
                                "required" : true,
                                "maxItems" : 2,
                                "minItems" : 1,
                                "type" : "array"
                            },
                            "reference" : {
                                "adapter" : {
                                    "secondaryFiles" : [
                                        "*.amb",
                                        "*.ann",
                                        "*.bwt",
                                        "*.pac",
                                        "*.sa"
                                    ],
                                    "order" : 2
                                },
                                "required" : true,
                                "type" : "file"
                            }
                        },
                        "type" : "object"
                    },
                    "requirements" : {
                        "resources" : {
                            "network" : false,
                            "diskSpace" : 0,
                            "ports" : [ ],
                            "mem" : 5000,
                            "cpu" : 0
                        },
                        "environment" : {
                            "container" : {
                                "imageId" : "9d3b9b0359cf",
                                "uri" : "docker://images.sbgenomics.com/rabix/bwa#9d3b9b0359cf",
                                "type" : "docker"
                            }
                        }
                    },
                    "documentAuthor" : "sinisa.ivkovic@sbgenomics.com",
                    "softwareDescription" : {
                        "name" : "BWA MEM",
                        "repo_name" : "bwa-mem",
                        "repo_owner" : "sinisa88"
                    }
                },
                "author" : "sinisa.ivkovic@sbgenomics.com",
                "app_id" : {
                    "_id" : "546a0c6a3c384469484f0a09",
                    "name" : "BWA MEM"
                },
                "_id" : "546a0c6a3c384469484f0a0a",
                "__v" : 0
            }
        },
        "relations" : [
            {
                "output_name" : "sam",
                "input_name" : "output_1",
                "end_node" : "Output_1_1",
                "start_node" : "BWA MEM_1",
                "id" : "117526"
            },
            {
                "output_name" : "input_1",
                "input_name" : "reference",
                "end_node" : "shism_1",
                "start_node" : "Input_1_1",
                "id" : "152660"
            },
            {
                "output_name" : "sam",
                "input_name" : "reference",
                "end_node" : "BWA MEM_1",
                "start_node" : "shism_1",
                "id" : "877907"
            }
        ],
        "nodes" : [
            {
                "order" : 1,
                "is_public" : true,
                "version" : 1,
                "json" : {
                    "adapter" : {
                        "args" : [
                            {
                                "value" : "mem",
                                "order" : 0
                            },
                            {
                                "value" : {
                                    "expr" : {
                                        "lang" : "javascript",
                                        "value" : "$job['allocatedResources']['cpu']"
                                    }
                                },
                                "prefix" : "-t",
                                "order" : 1
                            }
                        ],
                        "stdout" : "output.sam",
                        "baseCmd" : [
                            "bwa"
                        ]
                    },
                    "outputs" : {
                        "properties" : {
                            "sam" : {
                                "adapter" : {
                                    "secondaryFiles" : [ ],
                                    "meta" : {
                                        "__inherit__" : "reads",
                                        "file_type" : "sam"
                                    },
                                    "glob" : "output.sam",
                                    "streamable" : true
                                },
                                "type" : "file"
                            }
                        },
                        "type" : "object"
                    },
                    "inputs" : {
                        "properties" : {
                            "mark_shorter_split_hits_as_secondary" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-M",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "use_soft_clipping_for_supplementary_alignments" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-Y",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "append_FASTA/FASTQ_comment_to_SAM_output" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-C",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "output_all_alignments_for_SE_or_unpaired_PE" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-a",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "if_there_are_<INT_hits_with_score>80%_of_the_max_score,output_all_in_XA" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 0,
                                    "prefix" : "-h",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "minimum_score_to_output" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-T",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "read_group_header_line" : {
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-R",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "first_query_file_consists_of_interleaved_paired-end_sequences" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-p",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "read_type_Setting_-x_changes_multiple_parameters_unless_overriden" : {
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-x",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "penalty_for_an_unpaired_read_pair" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-U",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "penalty_for_5'-and_3'-end_clipping" : {
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 2,
                                "minItems" : 1,
                                "required" : false,
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "order" : 1,
                                    "prefix" : "-L",
                                    "separator" : "_"
                                },
                                "type" : "array"
                            },
                            "gap_extension_penalty;a_gap_of_size_k_cost_{-O}+{-E}*k'" : {
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 2,
                                "minItems" : 1,
                                "required" : false,
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "order" : 1,
                                    "prefix" : "-E",
                                    "separator" : "_"
                                },
                                "type" : "array"
                            },
                            "gap_open_penalties_for_deletions_and_insertions" : {
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 2,
                                "minItems" : 1,
                                "required" : false,
                                "adapter" : {
                                    "listSeparator" : ",",
                                    "order" : 1,
                                    "prefix" : "-O",
                                    "separator" : "_"
                                },
                                "type" : "array"
                            },
                            "penalty_for_a_mismatch" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-B",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "score_for_a_sequence_match,which_scales_options_-TdBOELU_unless_overridden" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-A",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "discard_full-length_exact_matches" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-e",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "skip_pairing;mate_rescue_performed_unless_-S_also_in_use" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-P",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "skip_mate_rescue" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-S",
                                    "separator" : "_"
                                },
                                "type" : "boolean"
                            },
                            "discard_a_chain_if_seeded_bases_shorter_than_ INT" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-W",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "look_for_internal_seeds_inside_a_seed_longer_than_k*1_5" : {
                                "enum" : null,
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-r",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "perform_at_most_INT_rounds_of_mate_rescues_for_each_read" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-m",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "drop_chains_shorter_than_FLOAT_fraction_of_the_longest_overlapping_chain" : {
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-D",
                                    "separator" : "_"
                                },
                                "type" : "string"
                            },
                            "skip_seeds_with_more_than_INT_occurrences" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-c",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "off-diagonal_X-dropoff" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-d",
                                    "separator" : "_"
                                },
                                "type" : "integer"
                            },
                            "band_width_for_banded_alignment" : {
                                "required" : false,
                                "adapter" : {
                                    "order" : 1,
                                    "prefix" : "-w",
                                    "separator" : ""
                                },
                                "type" : "integer"
                            },
                            "min_std_max_min" : {
                                "adapter" : {
                                    "separator" : "_",
                                    "prefix" : "",
                                    "order" : 1
                                },
                                "items" : {
                                    "type" : "number"
                                },
                                "maxItems" : 4,
                                "minItems" : 1,
                                "type" : "array"
                            },
                            "minimum_seed_length" : {
                                "adapter" : {
                                    "separator" : "_",
                                    "prefix" : "-k",
                                    "order" : 1
                                },
                                "type" : "integer"
                            },
                            "reads" : {
                                "adapter" : {
                                    "listStreamable" : true,
                                    "order" : 3
                                },
                                "items" : {
                                    "type" : "file"
                                },
                                "required" : true,
                                "maxItems" : 2,
                                "minItems" : 1,
                                "type" : "array"
                            },
                            "reference" : {
                                "adapter" : {
                                    "secondaryFiles" : [
                                        "*.amb",
                                        "*.ann",
                                        "*.bwt",
                                        "*.pac",
                                        "*.sa"
                                    ],
                                    "order" : 2
                                },
                                "required" : true,
                                "type" : "file"
                            }
                        },
                        "type" : "object"
                    },
                    "requirements" : {
                        "resources" : {
                            "network" : false,
                            "diskSpace" : 0,
                            "ports" : [ ],
                            "mem" : 5000,
                            "cpu" : 0
                        },
                        "environment" : {
                            "container" : {
                                "imageId" : "9d3b9b0359cf",
                                "uri" : "docker://images.sbgenomics.com/rabix/bwa#9d3b9b0359cf",
                                "type" : "docker"
                            }
                        }
                    },
                    "documentAuthor" : "sinisa.ivkovic@sbgenomics.com",
                    "softwareDescription" : {
                        "name" : "BWA MEM",
                        "repo_name" : "bwa-mem",
                        "repo_owner" : "sinisa88"
                    }
                },
                "author" : "sinisa.ivkovic@sbgenomics.com",
                "app_id" : {
                    "_id" : "546a0c6a3c384469484f0a09",
                    "name" : "BWA MEM"
                },
                "_id" : "546a0c6a3c384469484f0a0a",
                "__v" : 0,
                "id" : "BWA MEM_1",
                "adapter" : {
                    "args" : [
                        {
                            "value" : "mem",
                            "order" : 0
                        },
                        {
                            "value" : {
                                "expr" : {
                                    "lang" : "javascript",
                                    "value" : "$job['allocatedResources']['cpu']"
                                }
                            },
                            "prefix" : "-t",
                            "order" : 1
                        }
                    ],
                    "stdout" : "output.sam",
                    "baseCmd" : [
                        "bwa"
                    ]
                },
                "outputs" : {
                    "properties" : {
                        "sam" : {
                            "id" : "sam",
                            "name" : "sam",
                            "adapter" : {
                                "secondaryFiles" : [ ],
                                "meta" : {
                                    "__inherit__" : "reads",
                                    "file_type" : "sam"
                                },
                                "glob" : "output.sam",
                                "streamable" : true
                            },
                            "type" : "file"
                        }
                    },
                    "type" : "object"
                },
                "inputs" : {
                    "properties" : {
                        "mark_shorter_split_hits_as_secondary" : {
                            "id" : "mark_shorter_split_hits_as_secondary",
                            "name" : "mark_shorter_split_hits_as_secondary",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-M",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "use_soft_clipping_for_supplementary_alignments" : {
                            "id" : "use_soft_clipping_for_supplementary_alignments",
                            "name" : "use_soft_clipping_for_supplementary_alignments",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-Y",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "append_FASTA/FASTQ_comment_to_SAM_output" : {
                            "id" : "append_FASTA/FASTQ_comment_to_SAM_output",
                            "name" : "append_FASTA/FASTQ_comment_to_SAM_output",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-C",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "output_all_alignments_for_SE_or_unpaired_PE" : {
                            "id" : "output_all_alignments_for_SE_or_unpaired_PE",
                            "name" : "output_all_alignments_for_SE_or_unpaired_PE",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-a",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "if_there_are_<INT_hits_with_score>80%_of_the_max_score,output_all_in_XA" : {
                            "id" : "if_there_are_<INT_hits_with_score>80%_of_the_max_score,output_all_in_XA",
                            "name" : "if_there_are_<INT_hits_with_score>80%_of_the_max_score,output_all_in_XA",
                            "required" : false,
                            "adapter" : {
                                "order" : 0,
                                "prefix" : "-h",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "minimum_score_to_output" : {
                            "id" : "minimum_score_to_output",
                            "name" : "minimum_score_to_output",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-T",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "read_group_header_line" : {
                            "id" : "read_group_header_line",
                            "name" : "read_group_header_line",
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-R",
                                "separator" : "_"
                            },
                            "type" : "string"
                        },
                        "first_query_file_consists_of_interleaved_paired-end_sequences" : {
                            "id" : "first_query_file_consists_of_interleaved_paired-end_sequences",
                            "name" : "first_query_file_consists_of_interleaved_paired-end_sequences",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-p",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "read_type_Setting_-x_changes_multiple_parameters_unless_overriden" : {
                            "id" : "read_type_Setting_-x_changes_multiple_parameters_unless_overriden",
                            "name" : "read_type_Setting_-x_changes_multiple_parameters_unless_overriden",
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-x",
                                "separator" : "_"
                            },
                            "type" : "string"
                        },
                        "penalty_for_an_unpaired_read_pair" : {
                            "id" : "penalty_for_an_unpaired_read_pair",
                            "name" : "penalty_for_an_unpaired_read_pair",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-U",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "penalty_for_5'-and_3'-end_clipping" : {
                            "id" : "penalty_for_5'-and_3'-end_clipping",
                            "name" : "penalty_for_5'-and_3'-end_clipping",
                            "items" : {
                                "type" : "number"
                            },
                            "maxItems" : 2,
                            "minItems" : 1,
                            "required" : false,
                            "adapter" : {
                                "listSeparator" : ",",
                                "order" : 1,
                                "prefix" : "-L",
                                "separator" : "_"
                            },
                            "type" : "array"
                        },
                        "gap_extension_penalty;a_gap_of_size_k_cost_{-O}+{-E}*k'" : {
                            "id" : "gap_extension_penalty;a_gap_of_size_k_cost_{-O}+{-E}*k'",
                            "name" : "gap_extension_penalty;a_gap_of_size_k_cost_{-O}+{-E}*k'",
                            "items" : {
                                "type" : "number"
                            },
                            "maxItems" : 2,
                            "minItems" : 1,
                            "required" : false,
                            "adapter" : {
                                "listSeparator" : ",",
                                "order" : 1,
                                "prefix" : "-E",
                                "separator" : "_"
                            },
                            "type" : "array"
                        },
                        "gap_open_penalties_for_deletions_and_insertions" : {
                            "id" : "gap_open_penalties_for_deletions_and_insertions",
                            "name" : "gap_open_penalties_for_deletions_and_insertions",
                            "items" : {
                                "type" : "number"
                            },
                            "maxItems" : 2,
                            "minItems" : 1,
                            "required" : false,
                            "adapter" : {
                                "listSeparator" : ",",
                                "order" : 1,
                                "prefix" : "-O",
                                "separator" : "_"
                            },
                            "type" : "array"
                        },
                        "penalty_for_a_mismatch" : {
                            "id" : "penalty_for_a_mismatch",
                            "name" : "penalty_for_a_mismatch",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-B",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "score_for_a_sequence_match,which_scales_options_-TdBOELU_unless_overridden" : {
                            "id" : "score_for_a_sequence_match,which_scales_options_-TdBOELU_unless_overridden",
                            "name" : "score_for_a_sequence_match,which_scales_options_-TdBOELU_unless_overridden",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-A",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "discard_full-length_exact_matches" : {
                            "id" : "discard_full-length_exact_matches",
                            "name" : "discard_full-length_exact_matches",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-e",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "skip_pairing;mate_rescue_performed_unless_-S_also_in_use" : {
                            "id" : "skip_pairing;mate_rescue_performed_unless_-S_also_in_use",
                            "name" : "skip_pairing;mate_rescue_performed_unless_-S_also_in_use",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-P",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "skip_mate_rescue" : {
                            "id" : "skip_mate_rescue",
                            "name" : "skip_mate_rescue",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-S",
                                "separator" : "_"
                            },
                            "type" : "boolean"
                        },
                        "discard_a_chain_if_seeded_bases_shorter_than_ INT" : {
                            "id" : "discard_a_chain_if_seeded_bases_shorter_than_ INT",
                            "name" : "discard_a_chain_if_seeded_bases_shorter_than_ INT",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-W",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "look_for_internal_seeds_inside_a_seed_longer_than_k*1_5" : {
                            "id" : "look_for_internal_seeds_inside_a_seed_longer_than_k*1_5",
                            "name" : "look_for_internal_seeds_inside_a_seed_longer_than_k*1_5",
                            "enum" : null,
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-r",
                                "separator" : "_"
                            },
                            "type" : "string"
                        },
                        "perform_at_most_INT_rounds_of_mate_rescues_for_each_read" : {
                            "id" : "perform_at_most_INT_rounds_of_mate_rescues_for_each_read",
                            "name" : "perform_at_most_INT_rounds_of_mate_rescues_for_each_read",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-m",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "drop_chains_shorter_than_FLOAT_fraction_of_the_longest_overlapping_chain" : {
                            "id" : "drop_chains_shorter_than_FLOAT_fraction_of_the_longest_overlapping_chain",
                            "name" : "drop_chains_shorter_than_FLOAT_fraction_of_the_longest_overlapping_chain",
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-D",
                                "separator" : "_"
                            },
                            "type" : "string"
                        },
                        "skip_seeds_with_more_than_INT_occurrences" : {
                            "id" : "skip_seeds_with_more_than_INT_occurrences",
                            "name" : "skip_seeds_with_more_than_INT_occurrences",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-c",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "off-diagonal_X-dropoff" : {
                            "id" : "off-diagonal_X-dropoff",
                            "name" : "off-diagonal_X-dropoff",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-d",
                                "separator" : "_"
                            },
                            "type" : "integer"
                        },
                        "band_width_for_banded_alignment" : {
                            "id" : "band_width_for_banded_alignment",
                            "name" : "band_width_for_banded_alignment",
                            "required" : false,
                            "adapter" : {
                                "order" : 1,
                                "prefix" : "-w",
                                "separator" : ""
                            },
                            "type" : "integer"
                        },
                        "min_std_max_min" : {
                            "id" : "min_std_max_min",
                            "name" : "min_std_max_min",
                            "adapter" : {
                                "separator" : "_",
                                "prefix" : "",
                                "order" : 1
                            },
                            "items" : {
                                "type" : "number"
                            },
                            "maxItems" : 4,
                            "minItems" : 1,
                            "type" : "array"
                        },
                        "minimum_seed_length" : {
                            "id" : "minimum_seed_length",
                            "name" : "minimum_seed_length",
                            "adapter" : {
                                "separator" : "_",
                                "prefix" : "-k",
                                "order" : 1
                            },
                            "type" : "integer"
                        },
                        "reads" : {
                            "id" : "reads",
                            "name" : "reads",
                            "adapter" : {
                                "listStreamable" : true,
                                "order" : 3
                            },
                            "items" : {
                                "type" : "file"
                            },
                            "required" : true,
                            "maxItems" : 2,
                            "minItems" : 1,
                            "type" : "array"
                        },
                        "reference" : {
                            "id" : "reference",
                            "name" : "reference",
                            "adapter" : {
                                "secondaryFiles" : [
                                    "*.amb",
                                    "*.ann",
                                    "*.bwt",
                                    "*.pac",
                                    "*.sa"
                                ],
                                "order" : 2
                            },
                            "required" : true,
                            "type" : "file"
                        }
                    },
                    "type" : "object"
                },
                "requirements" : {
                    "resources" : {
                        "network" : false,
                        "diskSpace" : 0,
                        "ports" : [ ],
                        "mem" : 5000,
                        "cpu" : 0
                    },
                    "environment" : {
                        "container" : {
                            "imageId" : "9d3b9b0359cf",
                            "uri" : "docker://images.sbgenomics.com/rabix/bwa#9d3b9b0359cf",
                            "type" : "docker"
                        }
                    }
                },
                "documentAuthor" : "sinisa.ivkovic@sbgenomics.com",
                "softwareDescription" : {
                    "name" : "BWA MEM",
                    "repo_name" : "bwa-mem",
                    "repo_owner" : "sinisa88"
                }
            },
            {
                "id" : "Output_1_1",
                "outputs" : {
                    "type" : "object"
                },
                "inputs" : {
                    "properties" : {
                        "output_1" : {
                            "type" : "file",
                            "required" : false,
                            "id" : "output_1",
                            "name" : "Output_1"
                        }
                    },
                    "type" : "object"
                },
                "documentAuthor" : null,
                "softwareDescription" : {
                    "name" : "Output_1",
                    "repo_name" : "system",
                    "repo_owner" : "rabix"
                }
            },
            {
                "id" : "shism_1",
                "adapter" : {
                    "args" : [
                        {
                            "value" : "mem",
                            "order" : 0
                        },
                        {
                            "value" : 10,
                            "prefix" : "-t",
                            "order" : 1
                        }
                    ],
                    "stdout" : "output.sam",
                    "baseCmd" : [
                        "bwa"
                    ]
                },
                "outputs" : {
                    "properties" : {
                        "sam" : {
                            "id" : "sam",
                            "name" : "sam",
                            "adapter" : {
                                "secondaryFiles" : [ ],
                                "meta" : {
                                    "key2" : "test",
                                    "key1" : {
                                        "expr" : "$job"
                                    },
                                    "__inherit__" : ""
                                },
                                "glob" : "output.sam",
                                "streamable" : true
                            },
                            "type" : "file"
                        }
                    },
                    "type" : "object"
                },
                "inputs" : {
                    "properties" : {
                        "min_std_max_min" : {
                            "id" : "min_std_max_min",
                            "name" : "min_std_max_min",
                            "adapter" : {
                                "listSeparator" : ",",
                                "prefix" : "-I",
                                "order" : 1
                            },
                            "items" : {
                                "type" : "number"
                            },
                            "maxItems" : 4,
                            "minItems" : 1,
                            "type" : "array"
                        },
                        "minimum_seed_length" : {
                            "id" : "minimum_seed_length",
                            "name" : "minimum_seed_length",
                            "adapter" : {
                                "separator" : "_",
                                "prefix" : "-m",
                                "order" : 1
                            },
                            "type" : "integer"
                        },
                        "reads" : {
                            "id" : "reads",
                            "name" : "reads",
                            "adapter" : {
                                "listStreamable" : true,
                                "order" : 3
                            },
                            "items" : {
                                "type" : "file"
                            },
                            "required" : true,
                            "maxItems" : 2,
                            "minItems" : 1,
                            "type" : "array"
                        },
                        "reference" : {
                            "id" : "reference",
                            "name" : "reference",
                            "adapter" : {
                                "order" : 2
                            },
                            "required" : true,
                            "type" : "file"
                        }
                    },
                    "type" : "object"
                },
                "requirements" : {
                    "resources" : {
                        "network" : false,
                        "diskSpace" : 0,
                        "ports" : [ ],
                        "mem" : 5000,
                        "cpu" : 0
                    },
                    "environment" : {
                        "container" : {
                            "imageId" : "test",
                            "uri" : "test",
                            "type" : "docker"
                        }
                    }
                },
                "documentAuthor" : "milica.kadic.87@gmail.com",
                "softwareDescription" : {
                    "repo_name" : "test",
                    "description" : "lorem",
                    "name" : "shism",
                    "repo_owner" : "milica"
                }
            },
            {
                "id" : "Input_1_1",
                "outputs" : {
                    "properties" : {
                        "input_1" : {
                            "type" : "file",
                            "required" : false,
                            "id" : "input_1",
                            "name" : "input_1"
                        }
                    },
                    "type" : "object"
                },
                "inputs" : {
                    "type" : "object"
                },
                "documentAuthor" : null,
                "softwareDescription" : {
                    "name" : "Input_1",
                    "repo_name" : "system",
                    "repo_owner" : "rabix"
                }
            }
        ],
        "display" : {
            "nodes" : {
                "Input_1_1" : {
                    "y" : 178,
                    "x" : 292
                },
                "shism_1" : {
                    "y" : 266,
                    "x" : 662
                },
                "Output_1_1" : {
                    "y" : 448,
                    "x" : 1282
                },
                "BWA MEM_1" : {
                    "y" : 330,
                    "x" : 944
                }
            },
            "name" : "",
            "description" : "",
            "canvas" : {
                "zoom" : 1,
                "y" : -34,
                "x" : -196
            }
        }
    };

    var formated = formater.toRabixSchema(test_pipeline);

    res.json(formated);

});