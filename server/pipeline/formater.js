'use strict';

var _ = require('lodash');

var formater = {

    packedSchema: null,

    toRabixSchema: function (json) {

        // reset schema
        this.packedSchema = {};

        this._transformRelationsToSteps(json.relations, json.nodes);

        delete json.relations;
        json.steps = this.packedSchema.steps;

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

    _transformRelationsToSteps: function (relations, nodes) {

        var _self = this;

        this.packedSchema.steps = [];

        _.each(relations, function (rel) {
            var step, node_schema, node;
            
            _.each(nodes, function (n) {
                if (n.id = rel.end_node) {
                    node = n;
                }
            });
            node_schema = node.schema;

            step = {
                _id: rel.end_node,
                app: node_schema,
                inputs: {}
            };

            var from, out_name = false;

            from = rel.start_node + '.' + rel.output_name;

//            if (out_name) {
//                from = from + '.' + out_name;
//            }

            step.inputs[rel.input_name] = {
                $from: from
            };

            _self.packedSchema.steps.push(step);
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
    },

    _addSchema: function (json) {

    },

    _removeSchema: function () {

    },

    _packIO: function () {
        
    }

};


module.exports = formater;