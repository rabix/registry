'use strict';

var _ = require('lodash');

var formater = {

    packedSchema: null,

    toRabixSchema: function (j) {

        var json = _.clone(j);
        // reset schema
        this.packedSchema = {};

        if ( (!json.relations || json.relations.length === 0 ) && json.nodes.length === 1) {

            this.packedSchema.steps = [];
            this.packedSchema.steps.push(this._createOneAppStep(json));

        } else {
            this._transformRelationsToSteps(json.relations || [], json.nodes, json.schemas);
        }

        delete json.relations;
        delete json.schemas;
        delete json.nodes;

        json.steps = this.packedSchema.steps;

        return json;
    },

    _createOneAppStep: function (json) {
        var step = {},
            node = json.nodes[0],
            schema = json.schemas[node.id].json;

        step._id = node.id;
        step.app = schema;
        step.inputs = {};
        step.outputs = {};

        _.forEach(schema.inputs.properties, function (i, n) {
            step.inputs[n] = i;
        });

        _.forEach(schema.outputs.properties, function (o, n) {
            step.outputs[n] = o;
        });

        return step;
    },
    
    toPipelineSchema: function (json) {

        // reset schema
        this.packedSchema = {};

        this._transformStepsToRelations(json.steps);

        delete json.steps;
        json.relations = this.packedSchema.relations;

        return json;

    },

    _transformRelationsToSteps: function (relations, nodes, schemas) {

        var _self = this, from, to, pseudoStep = null;


        this.packedSchema.steps = [];

        _.each(relations, function (rel) {
            var step, node_schema, node;

            node_schema = schemas[rel.end_node];

            if (node_schema.softwareDescription && node_schema.softwareDescription.repo_name === 'system') {

                var s = _.filter(_self.packedSchema.steps, function (st) {
                    return st._id === rel.start_node;
                });

                pseudoStep = s.length === 0 ? {
                    _id: rel.start_node,
                    app: schemas[rel.start_node],
                    inputs: {},
                    outputs: {}
                } : s[0];

                if (node_schema.softwareDescription && node_schema.softwareDescription.repo_name !== 'system') {
                    to = rel.start_node + '.' + rel.input_name;
                } else {
                    to = rel.input_name;
                }

                pseudoStep.outputs[rel.output_name] = {
                    $to: to
                };

            } else {

                var exists = _.filter(_self.packedSchema.steps, function (s) {
                    return s._id === rel.end_node;
                });

                if (exists.length !== 0) {
                    step = exists[0];
                } else {
                    step = {
                        _id: rel.end_node,
                        app: node_schema,
                        inputs: {},
                        outputs: {}
                    };
                }

                from = rel.start_node + '.' + rel.output_name;

                if (schemas[rel.start_node].softwareDescription && schemas[rel.start_node].softwareDescription.repo_name === 'system') {
                    from = rel.output_name;
                }

                step.inputs[rel.input_name] = {
                    $from: from
                };


            }

            if (step) {
                step.app = _.clone(node_schema);
            } else {
                pseudoStep.app = _.clone(node_schema);
            }

            if ( exists && exists.length === 0) {
                _self.packedSchema.steps.push(step);
            } else if (pseudoStep) {
                _self.packedSchema.steps.push(pseudoStep);
            }
        });

    },
    
    _transformStepsToRelations: function (steps) {

        var relations = [];

        _.forEach(steps, function (step) {
            var end_node = step._id, input_name, output_name, start_node;

            _.forEach(step.inputs, function (from, input) {
                var relation, s;

                s = from.$from.split('.');

                if (s.length !== 1) {
                    start_node = s[0];
                    output_name = s[1];
                } else {

                }

                input_name = input;

                relation = {
                    end_node: end_node,
                    input_name: input_name,
                    output_name: output_name,
                    start_node: start_node,
                    type: 'connection',
                    // id needs to be a string
                    id: _.random(100000, 999999) + ''
                };

                relations.push(relation);
            });

        });

        this.packedSchema.relations = relations;
    }

};


module.exports = formater;