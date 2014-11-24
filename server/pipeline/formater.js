'use strict';

var _ = require('lodash');

var formater = {

    packedSchema: null,

    toRabixSchema: function (j) {

        var json = _.clone(j);
        // reset schema
        this.packedSchema = {};
        this.packedSchema.inputs = {};
        this.packedSchema.outputs = {};

        if ( (!json.relations || json.relations.length === 0 ) && json.nodes.length === 1) {
            var _id = json.nodes[0]._id;

            this.packedSchema.steps = [];

            this.packedSchema.steps.push({
                _id: _id,
                app: json.schemas[_id],
                inputs: {},
                outputs: {}
            });

        } else {
            this._transformRelationsToSteps(json.relations || [], json.nodes, json.schemas);
        }

        delete json.relations;
        delete json.schemas;
        delete json.nodes;

        json = _.extend(json, this.packedSchema);

        return json;
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

        var _self = this;

        this.packedSchema.steps = [];

        _.forEach(relations, function (rel) {
            var step, node_schema;

            node_schema = schemas[rel.end_node];

            if (_self._checkSystem(node_schema)) {
                _self._createInOut('outputs', node_schema);
            } else {
                step = _self._createOneAppStep(rel, nodes, schemas);
            }

            if (step) {
                step.app = _.clone(node_schema);
                _self.packedSchema.steps.push(step);
            }
        });

        this._generateSystemNodes(relations, nodes, schemas);

    },

    _generateSystemNodes: function (relations, nodes, schemas) {
        var _self = this;

        _.forEach(relations, function (rel) {

            var node_schema = schemas[rel.end_node];

            if (_self._checkSystem(node_schema)) {

                _self._attachOutput(rel);
                _self._createInOut(node_schema.softwareDescription.type + 's', node_schema);

            } else {
                node_schema = schemas[rel.start_node];
            }

            if (_self._checkSystem(node_schema)) {
                _self._createInOut(node_schema.softwareDescription.type + 's', node_schema);
            }

        });
    },
    
    _checkSystem: function (node_schema) {

        return node_schema.softwareDescription && node_schema.softwareDescription.repo_name === 'system';
    },

    _attachOutput: function (rel) {
        var filter = _.filter(this.packedSchema.steps, function (step) {
            return step._id === rel.start_node;
        });

        if (filter.length !== 0) {
            filter[0].outputs[rel.output_name] = {
                $to: rel.input_name
            };
        }
    },

    _createInOut: function (type, node) {
        var obj = this.packedSchema[type];

        if (typeof obj[node.id] === 'undefined') {
            obj[node.id] = node;
        }

    },

    _createOneAppStep: function (rel, nodes, schemas) {

        var from, exists, step = {};

        var node_schema = schemas[rel.end_node];

        step._id = rel.end_node;

        exists = _.filter(this.packedSchema.steps, function (s) {
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

        if (this._checkSystem(schemas[rel.start_node])) {
            from = rel.output_name;
        }

        step.inputs[rel.input_name] = {
            $from: from
        };

        return step;
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