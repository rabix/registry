/**
 * Created by filip on 2/6/15.
 *
 * Formatter Module
 * - Used for rabix workflow schema transformation
 */

'use strict';

//TODO: needs to be removed, used for sharing code between angular and node
var fs;
if (typeof require !== 'undefined') {
    var _ = require('lodash');
    fs = require('fs');
} else {
    fs = {};
}

var Const = {
    exposedSeparator: '$'
};

var baseUrl = '../test/mocks/';

function resolveApp(name) {
    var json;

    try {
        json = fs.readFileSync(baseUrl + name);
    } catch (e) {
        console.log('Cannot read file to resolve app: ' + name, e);
    }

    if (json) {
        json = JSON.parse(json.toString());
        return json;
    } else {
        return false;
    }
}

/**
 * Bare Rabix schema model
 *
 * @type {{@type: string, @context: string, steps: Array, dataLinks: Array}}
 */
var RabixModel = {
    '@type': 'Workflow',
    '@context': 'https://raw.githubusercontent.com/common-workflow-language/common-workflow-language/draft2/specification/context.json',
    'steps': [],
    'dataLinks': [],
    'inputs': [],
    'outputs': []
};

/**
 * Common used stuff
 *
 * @type {{fileFilter: string[], _fileTypeCheck: _fileTypeCheck, checkTypeFile: checkTypeFile}}
 * @private
 */
var _common = {};

/**
 * Main formatter
 *
 * @type {{toRabixRelations: toRabixRelations, createSteps: createSteps, createWorkflowInOut: createWorkflowInOut, _checkStepExists: _checkStepExists, createInOutNodes: createInOutNodes, toPipelineRelations: toPipelineRelations, createSchemasFromSteps: createSchemasFromSteps, _generateIOSchema: _generateIOSchema}}
 * @private
 */
var _formatter = {

    /**
     * ---------------------
     * Rabix Schema Creation
     * ---------------------
     */

    /**
     * Create data links from relations
     *
     * @param relations
     * @param exposed
     * @param workflow
     * @returns {Array}
     */
    toRabixRelations: function (relations, exposed, workflow) {
        var _self = this,
            dataLinks = [];

        _.forEach(relations, function (rel) {
            var dataLink = {
                source: '',
                destination: ''
            };

            if (rel.input_name === rel.end_node) {
                dataLink.destination = rel.end_node;
            } else {
                dataLink.destination = rel.end_node + '/' + rel.input_name.slice(1);
            }

            if (rel.output_name === rel.start_node) {
                dataLink.source = rel.start_node;
            } else {
                dataLink.source = rel.start_node + '/' + rel.output_name.slice(1);
            }

            dataLinks.push(dataLink);
        });

        _.forEach(exposed, function (schema, ids) {

            var dataLink = {
                source: '',
                destination: ''
            };

            var input_id = '#' + ids.split(Const.exposedSeparator)[1];
            dataLink.destination = ids.replace(Const.exposedSeparator, '/');

            _self._createWorkflowInput(input_id, schema, workflow);

            dataLink.source = input_id;

            dataLinks.push(dataLink);

        });

        return dataLinks;
    },

    _createWorkflowInput: function (id, schema, workflow) {

        var model = {
            '@id': id
        };

        model = _.extend(model, schema);

        if (model.name) {
            delete model.name;
        }

        if (model.id) {
            delete model.id;
        }

        workflow.inputs.push(model);
    },

    /**
     * Create Rabix Steps from node schemas
     *
     * @param schemas
     * @param relations
     * @returns {Array}
     */
    createSteps: function (schemas, relations) {

        var _self = this,
            steps = [];

        _.forEach(relations, function (rel) {

            var schema = schemas[rel.end_node],
                id = rel.end_node,
                step = {
                    '@id': id,
                    app: schema.ref || schema,
                    inputs: [],
                    outputs: []
                };

            if (schema.ref) {
                delete schema.ref;
            }

            if (schema.id) {
                delete schema.id;
            }

            if (!_common.checkSystem(schema)) {

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

                if (!_self._checkStepExists(steps, id)) {
                    steps.push(step);
                }

            }

        });

        return steps;
    },

    /**
     * Add values to step inputs if values set
     *
     * @param steps
     * @param values
     */
    addValuesToSteps: function (steps, values) {

        _.forEach(values, function (inputs, stepId) {
            if (typeof stepId !== 'undefined') {

                var step = _.find(steps, function (s) {
                    return s['@id'] === stepId;
                });

                if (typeof step !== 'undefined') {
                    _.forEach(inputs, function (val, input_id) {

                        var inp = _.find(step.inputs, function (i) {
                            return i['@id'] === step['@id'] + '/' + input_id.slice(1);
                        });

                        if (typeof inp !== 'undefined') {
                            inp.value = val;
                        } else {
                            console.error('Invalid input id to attach values to', input_id);
                        }
                    });
                }
            }
        });

    },

    /**
     * Create Workflow inputs and outputs
     *
     * @param workflow
     * @param schemas
     */
    createWorkflowInOut: function (workflow, schemas) {

        _.forEach(schemas, function (schema) {
            var type;

            if (_common.checkSystem(schema)) {
                var internalType;
                type = schema.softwareDescription.type;
                delete schema.softwareDescription;

                _.forEach(schema.inputs, function (inp) {
                    delete inp.label;
                    delete inp.name;
                    delete inp.id;
                });

                _.forEach(schema.outputs, function (out) {
                    delete out.label;
                    delete out.name;
                    delete out.id;
                });

                internalType = type === 'input' ? 'outputs' : 'inputs';

                workflow[type + 's'].push(schema[internalType][0]);
            }
        });

    },

    /**
     * Check if step allready exists
     *
     * @param steps
     * @param id
     * @private
     */
    _checkStepExists: function (steps, id) {
        var exists = _.find(steps, function (step) {
            return step['@id'] === id;
        });

        return typeof exists !== 'undefined';
    },

    /**
     * ---------------------
     * Pipeline Schema Creation
     * ---------------------
     */
    createInOutNodes: function (schemas, workflow) {

        var _self = this,
            system = {};

        if (!_.isArray(workflow.inputs)) {
            workflow.inputs = new Array(workflow.inputs);
        }

        _.forEach(workflow.inputs, function (input) {
            var id = input['@id'];

            if (_common.checkTypeFile(input.schema[1] || input.schema[0])) {
                system[id] = _self._generateIOSchema('input', input, id);
            }
        });

        if (!_.isArray(workflow.outputs)) {
            workflow.outputs = new Array(workflow.outputs);
        }

        _.forEach(workflow.outputs, function (output) {
            var id = output['@id'];

            if (_common.checkTypeFile(output.schema[1] || output.schema[0])) {
                system[id] = _self._generateIOSchema('output', output, id);
            }
        });

        return _.assign(schemas, system);

    },

    toPipelineRelations: function (schemas, dataLinks, exposed, workflow) {

        var relations = [];

        function checkTypeFile(src, dest) {

            var input, schema,
                node_id = dest[0],
                input_id = dest.length === 1 ? dest[0] : '#' + dest[1],
                node = schemas[node_id];

            input = _.find(node.inputs, function (i) {
                return i['@id'] === input_id;
            });

            if (typeof input !== 'undefined') {
                schema = input.schema[1] || input.schema[0];

                return _common.checkTypeFile(schema);
            } else {
                console.log('Input %s not found on node %s', input_id, node_id);
            }

            return false;
        }

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

            if (checkTypeFile(src, dest)) {

                if (src.length === 1) {
                    relation.output_name = relation.start_node = src[0];
                } else {
                    relation.output_name = '#' + src[1];
                    relation.start_node = src[0];
                }

                if (dest.length === 1) {
                    relation.input_name = relation.end_node = dest[0];
                } else {
                    relation.input_name = '#' + dest[1];
                    relation.end_node = dest[0];
                }

                relations.push(relation);

            } else {
                if (src.length === 1) {
                    src = src[0];

                    var ex = _.find(workflow.inputs, function (i) {
                        return i['@id'] === src;
                    });

                    if (typeof ex !== 'undefined') {
                        //remove # with slice in front of input id (cliche form builder required)
                        exposed[dest[0]+ Const.exposedSeparator + dest[1]] = ex;
                    } else {
                        console.error('Param exposed but not set in workflow inputs');
                    }

                } else {
                    console.error('Param must be exposed as workflow input');
                }
            }

        });

        return relations;

    },

    createSchemasFromSteps: function (steps, values) {
        var schemas = {};

        _.forEach(steps, function (step) {
            var stepId = step['@id'], ref;

            if (typeof step.app === 'string') {
                ref = step.app;
                step.app = resolveApp(step.app);
                step.app.ref = ref;
            }

            step.app.id = stepId;

            schemas[stepId] = step.app;

            // Check if values are set on step inputs
            // and attach them to values object
            _.forEach(step.inputs, function (input) {
                if (input.value) {
                    var input_id = '#' + input['@id'].split('/')[1],
                        obj = values[stepId] = {};

                    obj[input_id] = input.value;
                }
            });
        });

        return schemas;
    },

    _generateIOSchema: function (type, schema, id) {

        var internalType = type === 'input' ? 'outputs' : 'inputs';

        schema.id = id;

        schema.label = schema.label || id;

        var model = {
            '@id': id,
            'label': schema.label || 'Rabix System app',
            'softwareDescription': {
                'repo_owner': 'rabix',
                'repo_name': 'system',
                'type': type,
                'name': schema.label
            },
            'inputs': [],
            'outputs': []
        };

        model[internalType].push(schema);

        model.id = id;

        return model;
    },

    createNodeIds: function (nodes) {
        var filter = ['https://', 'http://'];

        function checkUrl(id) {
            var r = false;
            
            _.forEach(filter, function (f) {
                if ( _.contains(id,f) ) {
                    r = true;
                }
            });

            return r;
        }

        _.forEach(nodes, function (node) {
            var _id = node['@id'];

            if (!_id || checkUrl(_id)) {
                _id = node.label;
            }

            node.id = _id;

            console.log('Node: %s; Node id: %s', node.label, node.id);
        });

        return nodes;
    }

};

/**
 * Helper for creating missing display property when importing json thats not generated by registrys workflow editor
 *
 * @type {{sysCoords: {x: number, y: number}, const: {gap: number}, _findMax: _findMax, _findMiddleY: _findMiddleY, _createDisplay: _createDisplay, _generateSystemNodeCoords: _generateSystemNodeCoords, _generateNodeCoords: _generateNodeCoords, generateNodesCoords: generateNodesCoords, _fixSystemNodesCoords: _fixSystemNodesCoords, fixDisplay: fixDisplay}}
 * @private
 */
var _helper = {

    sysCoords: {
        x: 0,
        y: 0
    },

    const: {
        gap: 100
    },

    _findMax: function (display) {

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

        if (!_common.checkSystem(node)) {
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

        if (_common.checkSystem(node)) {
            return;
        }

        coords.x = this._findMax(display);
        coords.y = this._findMiddleY(display);

        return coords;
    },

    _generateNodesCoords: function (display, nodes) {
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

            if (_common.checkSystem(node)) {
                if (!dis || (!dis.x || dis.y)) {

                    coords = _self._generateSystemNodeCoords(node, display);
                    display.nodes[nodeId] = coords;

                }
            }

        });
    },

    fixDisplay: function (display, nodes) {
        var flag = false;

        this.sysCoords.x = 0;
        this.sysCoords.y = 0;

        if (typeof display === 'undefined') {
            display = this._createDisplay();
            flag = true;
        }

        if (!display.nodes) {
            display.nodes = {};
            flag = true;
        }

        if (!display.canvas) {
            display.canvas = {
                x: 0,
                y: 0,
                zoom: 1
            };
        }

        if (flag) {
            this._generateNodesCoords(display, nodes);
            this._fixSystemNodesCoords(display, nodes);
        }

        return display;
    }
};

/**
 * Public exposed formatter methods
 *
 * @type {{toRabixSchema: toRabixSchema, toPipelineSchema: toPipelineSchema}}
 */
var fd2 = {

    toRabixSchema: function (p) {
        var json = _.clone(p, true),
            model = _.clone(RabixModel, true);

        model.display = json.display;
        model.dataLinks = _formatter.toRabixRelations(json.relations, json.exposed, model);
        model.steps = _formatter.createSteps(json.schemas, json.relations);

        _formatter.addValuesToSteps(model.steps, json.values);

        _formatter.createWorkflowInOut(model, json.schemas, json.relations);

        return model;
    },

    toPipelineSchema: function (p) {
        var json = _.clone(p, true),
            relations, nodes, schemas, display,
            exposed = {},
            values = {};

        schemas = _formatter.createSchemasFromSteps(json.steps, values);

        //extend schemas with inputs and outputs
        schemas = _formatter.createInOutNodes(schemas, json, values);

        //clone schemas to create nodes to manipulate on them
        nodes = _.toArray(_.clone(schemas, true));

//        _formatter.createNodeIds(nodes);

        display = _helper.fixDisplay(json.display, nodes);

        relations = _formatter.toPipelineRelations(schemas, json.dataLinks, exposed, json);


        return {
            exposed: exposed,
            values: values,
            display: display,
            nodes: nodes,
            schemas: schemas,
            relations: relations
        };
    }
};

//TODO: needs to be removed, used for sharing code between angular and node
if (typeof module !== 'undefined' && module.exports) {
    _common = require('./common');

    module.exports = fd2;

} else if (typeof angular !== 'undefined') {
    angular.module('registryApp.dyole')
        .factory('FormaterD2', ['Const', 'common', function (Cons, Common) {
            Const = Cons;
            _common = Common;

            return fd2;
        }]);
}