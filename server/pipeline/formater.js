var _ = require('lodash');

var formater = {

    packedSchema: null,

    toRabixSchema: function (json) {

        // reset schema
        this.packedSchema = {};

        _.map(json.nodes, function (node) {
            var nodeWrapper = node.wrapper,
                app;

            app = _.find(json.schemas, function (app) {
                var wrapper = app.wrapper;
                return wrapper.repo_id === nodeWrapper.repo_id && wrapper.image_id === nodeWrapper.image_id && wrapper.classname === nodeWrapper.classname;
            });

//                node.schema = app.app.schema;
            json.display.nodes[node.id].schema = app.app.schema;
//                return self.mergeNodeAndApp(app, node, displayNodes[node.id] || {x: 0, y: 0});
        });

        this._transformRelationsToSteps(json.relations, json.display.nodes);

        delete json.relations;
        json.steps = this.packedSchema.steps;

        return this.packedSchema;
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