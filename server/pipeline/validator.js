'use strict';

var _ = require('lodash');
var Sort = require('./top-sort');

var validator = {

    errors: [],
    paramErrors: [],

    validate: function (json) {

        this.errors = [];
        this.paramErrors = [];

        this._completeGraph(json);
        this._duplicateRelations(json);
        this._cyclicGraph(json);
        this._requiredInputs(json);

        return {
            errors: _.uniq(this.errors),
            paramErrors: this.paramErrors
        };
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
            nodes = json.nodes;
        
        var checkConnected = function (nodeId, inputName) {
            var filter = _.filter(json.relations, function (rel) {
                return rel.end_node === nodeId && rel.input_name === inputName;
            });

            return filter.length === 0;
        };

        _.forEach(nodes, function (node) {
            // only inputs should be validated since outputs
            var inputs = node.inputs.properties;

            _.forEach(inputs, function (input) {
                if ((input.type === 'file' || input.items && input.items.type === 'file') && input.required === true) {
                    if (checkConnected(node.id, input.name)) {
                        _self.errors.push('There is required input file: "' + input.name + '" that is not set on node: ' + node.id);
                    }
                } else if (input.required === true) {
                    _self.paramErrors.push('There is required input: "' + input.name + '" that is not set on node: ' + node.id);
                }
            });
        });
    }
    
};

module.exports = validator;