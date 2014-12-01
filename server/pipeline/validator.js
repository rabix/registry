'use strict';

var _ = require('lodash');
var Sort = require('./top-sort');

var schema = {
    display: {
        canvas: {
            x: { type: 'number' },
            y: { type: 'number' },
            zoom: { type: 'number' }
        },
        nodes: {
            type: 'array',
            $schema: {
                _id: 'string',
                x: { type: 'number', required: true },
                y: { type: 'number', required: true }
            }
        }
    },
    steps: {
        type: 'array',
        required: true,
        $schema: {
            _id: { type: 'string', required: true },
            app: { type: 'string', required: true },
            inputs: {
                type: 'object',
                required: true
            }
        }
    }
};

var validator = {

    errors: [],

    validate: function (json) {

        this.errors = [];

        this._completeGraph(json);
        this._duplicateRelations(json);
        this._cyclicGraph(json);
        this._requiredInputs(json);

        return _.uniq(this.errors);
    },

    _completeGraph: function (graph) {
        var _self = this,
            relations = graph.relations,
            nodes = _.cloneDeep(graph.nodes);
        
        _.forEach(relations, function (relation) {
            var start = relation.start_node,
                end = relation.end_node;

            _.remove(nodes, function (node) {
                return start === node.id || end === node.id;
            });
        });

        if (nodes.length !== 0) {
            _.forEach(nodes, function (node) {
                _self.errors.push('Node not connected: ' + node.id);
            });
        }
    },
    
    _duplicateRelations: function (graph) {
        var relations = graph.relations, _self = this;
        
        _.forEach(relations, function (relation) {

            var duplicate = _.filter(relations, function (rel) {

                if (rel.id === relation.id) {
                    return false;
                }

                var check = rel.start_node === relation.start_node && rel.end_node === relation.end_node,
                    portCheck = rel.input_name === relation.input_name && rel.output_name === relation.output_name,
                    reverseCheck, reversePortCheck;

                    reverseCheck = rel.start_node === relation.end_node && rel.end_node === relation.start_node;
                    reversePortCheck = rel.input_name === relation.output_name && rel.output_name === relation.input_name;

                    return (check && portCheck) || ( reverseCheck && reversePortCheck);
            });

            if (duplicate.length !== 0) {
                _self.errors.push('Duplicated connection at: start_node: '+ relation.start_node +' , end_node: ' + relation.end_node);
            }
        });
    },

    _cyclicGraph: function (json) {

        var _self = this,
            result,
            relations = json.relations;

        result = Sort.tsort(relations);

        if (result.errors.length !== 0) {
            _.forEach(result.errors, function (err) {
                _self.errors.push(err);
            });
        }

    },

    _requiredInputs: function (json) {
        var _self = this,
            nodes = json.nodes,
            relations = json.relations;
        
        var checkExsits = function (input, node) {

            var exists = _.filter(relations, function (rel) {
                if (rel.end_node === node.id && rel.input_name === input.name) {
                    console.log(rel);
                }
                return rel.end_node === node.id && rel.input_name === input.name;
            });

            return exists.length !== 0;
        };

        _.forEach(nodes, function (node) {
            var inputs = node.inputs.properties;

            _.forEach(inputs, function (input) {
                if (input.type === 'file' && input.required && input.required === true) {
                    if (!checkExsits(input, node)) {
                        _self.errors.push('There is required input "' + input.name + '" that is not set on node: ' + node.id);
                    }
                }
            });
        });
    }
    
};

module.exports = validator;