var _ = require('lodash');

var formater = {

    packedSchema: null,

    toRabixSchema: function (json) {

        this._transformRelationsToSteps(json.relations);

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

            _.each(nodes, function (n) {
                _.each(n.schema.outputs, function (out) {
                    if (out.name === rel.output_name) {
                        from = n.id;
                        if ( n.type !== 'input' ) {
                            out_name = out.name;
                        }
                    }
                });
            });

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