/**
 * Created by filip on 2/6/15.
 */

'use strict';

var _ = require('lodash');
var fs = require('fs');

var baseUrl = '../test/mocks/';

function resolveApp(name) {
    var json;

    try {
        json = fs.readFileSync(baseUrl + name);
    } catch(e) {
        console.log('Cannot read file to resolve app: ' + name, e);
    }

    if (json) {
        json = JSON.parse(json.toString());
        return json;
    } else {
        return false;
    }
}

var RabixModel = {
    '@type': 'Workflow',
    '@context': 'https://raw.githubusercontent.com/common-workflow-language/common-workflow-language/draft2/specification/context.json',
    'steps': [],
    'dataLinks': []
};

var _formater = {

    toRabixRelations: function (relations) {
        var dataLinks = [];

        _.forEach(relations, function (rel) {
            var dataLink = {
                source: '',
                destination: ''
            };

            if (rel.input_name === rel.end_node) {
                dataLink.destination = rel.end_node;
            } else {
                dataLink.destination = rel.end_node + '/' + rel.input_name;
            }

            if (rel.output_name === rel.start_node) {
                dataLink.source = rel.start_node;
            } else {
                dataLink.source = rel.start_node + '/' + rel.output_name;
            }

            dataLinks.push(dataLink);
        });

        return dataLinks;
    },

    createSteps: function (schemas, relations) {

        var _self = this,
            steps = [];

        _.forEach(relations, function (rel) {


            var schema = schemas[rel.end_node],
                id = rel.end_node,
                step = {
                    '@id': id,
                    app: schema.ref,
                    inputs: [],
                    outputs: []
                };

            if (!_self._checkSystem(schema)) {

                _.forEach(schema.inputs, function (input) {
                    step.inputs.push({
                        '@id': id + '/' + input['@id'].slice(1, input['@id'].length)
                    });
                });

                _.forEach(schema.outputs, function (output) {
                    step.outputs.push({
                        '@id': id + '/' + output['@id'].slice(1, output['@id'].length)
                    });
                });

                steps.push(step);

            }

        });

        return steps;
    },

    createWorkflowInOut: function (workflow, schemas) {
        var _self = this;

        workflow.inputs = [];
        workflow.outputs = [];

        _.forEach(schemas, function (schema) {
            var node = schema.schema,
                type;

            if (_self._checkSystem(schema)) {
                type = schema.softwareDescription.type;
                delete node.name;
                workflow[type+'s'].push(node);
            }
        });

    },

    createInOutNodes: function (schemas, workflow) {

        var _self = this,
            system = {};

        if (!_.isArray(workflow.inputs)) {
            workflow.inputs = new Array(workflow.inputs);
        }

        _.forEach(workflow.inputs, function (input) {
            var id = input['@id'];

            system[id] = _self._generateIOSchema('input', input, id);
        });

        if (!_.isArray(workflow.outputs)) {
            workflow.outputs = new Array(workflow.outputs);
        }

        _.forEach(workflow.outputs, function (output) {
            var id = output['@id'];

            system[id] = _self._generateIOSchema('output', output, id);
        });

        return _.assign(schemas, system);

    },

    toPipelineRelations: function (dataLinks) {

        var relations = [];

        _.forEach(dataLinks, function (dataLink) {
            var dest = dataLink.destination.split('/'),
                src = dataLink.source.split('/'),
                relation = {
                    input_name: '',
                    start_node: '',
                    output_name: '',
                    end_node: '',
                    id: _.random(100000, 999999) + '', // it has to be a string
                    type: 'connection'
                };

            if (src.length === 1) {
                relation.output_name = relation.start_node = src[0];
            } else {
                relation.output_name = src[1];
                relation.start_node = src[0];
            }

            if (dest.length === 1) {
                relation.input_name = relation.end_node = dest[0];
            } else {
                relation.input_name = dest[1];
                relation.end_node = dest[0];
            }

            relations.push(relation);
        });

        return relations;

    },

    createSchemasFromSteps: function (steps) {
        var schemas = {};

        _.forEach(steps, function (step) {
            var stepId = step['@id'], ref;

            if (typeof step.app === 'string') {
                ref = step.app;
                step.app = resolveApp(step.app);
                step.app.ref = ref;
            }

            step.app['@id'] = stepId;

            schemas[stepId] = step.app;
        });

        return schemas;
    },

    _checkSystem: function (node_schema) {

        return node_schema.softwareDescription && node_schema.softwareDescription.repo_name === 'system';
    },

    _generateIOSchema: function (type, schema, id) {

        var internalType = type === 'input' ? 'outputs' : 'inputs';

        schema.id = id;

        schema.name = schema.name || id;

        var model = {
            'name': schema.name || 'System app',
            'softwareDescription': {
                'repo_owner': 'rabix',
                'repo_name': 'system',
                'type': type,
                'name': schema.name
            },
            'inputs': {
                type: 'object'
            },
            'outputs': {
                type: 'object'
            },
            schema: schema
        };

        model[internalType].properties = {};
        model[internalType].properties[schema.id] = schema;

        model[internalType].properties[schema.id].name = schema.id;
        model[internalType].properties[schema.id].id = schema.id;

        model.id = id;

        return model;
    }

};

var _helper = {

    sysCoords: {
        x: 0,
        y: 0
    },

    const: {
        gap: 100
    },

    _findMax: function(display) {

        var nodes = display.nodes, m = 200;

        _.forEach(nodes, function (dis) {
            if (dis.x > m) {
                m = dis.x;
            }
        });

        return m + this.const.gap;
    },

    _findMiddleY: function (display) {
        var nodes = display.nodes, min = 0, max = 400;

        _.forEach(nodes, function (dis) {

            if (dis.y > max) {
                max = dis.y;
            }

            if (dis.y < min) {
                min = dis.y;
            }

        });

        return (max - min) / 2;
    },

    _createDisplay: function () {

        return {
            nodes: {},
            canvas: {
                x: 0,
                y: 0,
                zoom: 1
            }
        };

    },

    _generateSystemNodeCoords: function (node, display) {
        var x = 100,
            y = 100,
            isInput;

        if (!_formater._checkSystem(node)) {
            return false;
        }

        isInput = node.softwareDescription.type === 'input';

        if (!isInput) {
            x = this._findMax(display);
        }

        this.sysCoords.y += this.const.gap;

        y = this.sysCoords.y;

        return {
            x: x,
            y: y
        };

    },

    _generateNodeCoords: function (node, display) {
        var coords = {
            x: 0,
            y: 0
        };

        if (_formater._checkSystem(node)) {
            return;
        }

        coords.x = this._findMax(display);
        coords.y = this._findMiddleY(display);

        return coords;
    },

    generateNodesCoords: function (display, nodes) {
        var _self = this;

        _.forEach(nodes, function (node) {

            var nodeId = node['@id'],
                dis = display.nodes[nodeId],
                coords;

            if (!dis || (!dis.x || dis.y)) {

                coords = _self._generateNodeCoords(node, display);
                if (coords) {
                    display.nodes[nodeId] = coords;
                }

            }

        });

    },

    _fixSystemNodesCoords: function (display, nodes) {
        var _self = this;

        _.forEach(nodes, function (node) {
            var nodeId = node.id,
                dis = display.nodes[nodeId],
                coords;

            if (_formater._checkSystem(node)) {
                if (!dis || (!dis.x || dis.y)) {

                    coords = _self._generateSystemNodeCoords(node, display);
                    display.nodes[nodeId] = coords;

                }
            }

        });
    },

    fixDisplay: function (display, nodes) {

        this.sysCoords.x = 0;
        this.sysCoords.y = 0;

        if (!display) {
            display = this._createDisplay();
        }

        if (!display.nodes) {
            display.nodes = {};
        }

        if (!display.canvas) {
            display.canvas = {
                x: 0,
                y: 0,
                zoom: 1
            };
        }

        this.generateNodesCoords(display, nodes);
        this._fixSystemNodesCoords(display, nodes);

        return display;
    }
};

var fd2 = {

    toRabixSchema: function (p) {
        var json = _.clone(p, true),
            model = _.clone(RabixModel, true);

        model.dataLinks = _formater.toRabixRelations(json.relations);
        model.steps = _formater.createSteps(json.schemas, json.relations);

        _formater.createWorkflowInOut(model, json.schemas, json.relations);

        return model;
    },

    toPipelineSchema: function (p) {
        var json = _.clone(p, true),
            relations, nodes, schemas, display;

        relations = _formater.toPipelineRelations(json.dataLinks);
        schemas = _formater.createSchemasFromSteps(json.steps);

        //extend schemas with inputs and outputs
        schemas = _formater.createInOutNodes(schemas, json);

        nodes = _.toArray(schemas);

        display = _helper.fixDisplay(json.display, nodes);


        return {
            display: display,
            nodes: nodes,
            schemas: schemas,
            relations: relations
        };
    }
};

module.exports = fd2;
