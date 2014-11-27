'use strict';

var _ = require('lodash');

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

        this._completeGraph(json);

        return this.errors;
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
                _self.errors.push('Node not connected: %s', node.id);
            });
        }
    },
    
    _duplicateRelations: function (graph) {
        var relations = graph.relations, _self = this;
        
        _.forEach(relations, function (relation) {

            var duplicate = _.find(relations, function (rel) {

                var check = rel.start_node === relation.start_node && rel.end_node === relation.end_node,
                    reverseCheck, portCheck, reversePortCheck;

                    reverseCheck = rel.start_node === relation.end_node && rel.end_node === relation.start_node;


                    portCheck = rel.input_name === relation.input_name && rel.output_name === relation.output_name;
                    reversePortCheck = rel.input_name === relation.output_name && rel.output_name === relation.input_name;

                    return (check && portCheck) || ( reverseCheck && reversePortCheck);
            });

            if (duplicate.length !== 0) {
                _self.errors.push('Duplicated connection at: start_node: %s , end_node: %s', relation.start_node, relation.end_node);
            }
        });
    }
    
    
};

module.exports = validator;