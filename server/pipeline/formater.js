var _ = require('lodash');

var formater = {

    packedSchema: null,

    toRabixSchema: function (json) {

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

        return this.packedSchema;
    },
    
    toPipelineSchema: function (json) {

    },

    _transformRelationsToSteps: function (relations, nodes) {

        var _self = this;

        this.packedSchema = {};
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

            if (out_name) {
                from = from + '.' + out_name;
            }

            step.inputs[rel.input_name] = {
                $from: from
            };

            _self.packedSchema.steps.push(step);
        });

    },
    
    _transformStepsToRelations: function () {
        
    },

    _packIO: function () {
        
    }

};


module.exports = formater;