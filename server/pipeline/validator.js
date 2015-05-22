'use strict';

var _ = require('lodash');
var Sort = require('./top-sort');

var Consts = {
    exposedSeparator: '$'
};

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
            nodes = _.clone(graph.nodes, true);
        
        _.forEach(relations, function (relation) {
            var start = relation.start_node,
                end = relation.end_node;

            _.remove(nodes, function (node) {
                return start === node.id || end === node.id;
            });
        });

        if (nodes && nodes.length !== 0) {
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

    /**
     * Check for cyclic graph
     *
     * @param json
     * @private
     */
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

    /**
     * Go through schemas and check if there are required inputs that are not set or exposed
     *
     * @param json
     * @private
     */
    _requiredInputs: function (json) {
        var _self = this,
            schemas = json.schemas;

        var checkConnected = function (nodeId, inputName) {
            var filter = _.filter(json.relations, function (rel) {
                return rel.end_node === nodeId && rel.input_name === inputName;
            });

            return filter.length === 0;
        };

        _.forEach(schemas, function (schema) {
            var inputs = schema.inputs;

            _.forEach(inputs.required, function (input) {
                var inProp = inputs.properties[input];

                if (inProp) {
                    if (inProp.type === 'File' || (inProp.items && inProp.items.type === 'File')) {
                        if (checkConnected(schema.id, input)) {
                            _self.errors.push('There is required input file: "' + input + '" that is not set on node: ' + schema.id);
                        }
                    } else {
                        _self._checkInputSet(json, schema, input);
                    }
                }
            });
        });
    },

    _checkReqFileConnected: function (json, schema, inputId) {
        var nodeId = schema.id;

        var exists = _.filter(json.relations, function (rel) {
           return rel.end_node === nodeId && rel.input_name === inputId;
        });

        if (exists.length === 0) {
            this.paramErrors.push('There is required input: ' + inputId + ' in app: ' + schema.id + ' ;that has no value (not connected)');
        }
    },

    _checkInputSet: function (json, schema, input) {
        var exists;

        exists = json.values[schema.id] && json.values[schema.id][input];

        if (!exists) {
            exists = json.exposed[schema.id+ Consts.exposedSeparator + input];

            if (!exists) {
                this.paramErrors.push('There is required input: ' + input + ' in app: ' + schema.id + ' ;that has no value and is not exposed');
            }
        }
    }
    
};

module.exports = validator;