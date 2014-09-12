/**
 * Created by milica on 9/12/14.
 */
'use strict';

var _ = require('lodash');

var mapDefinition = {
    root: {
        softwareDescription: {type: 'object'},
        documentAuthor: {type: 'string'},
        requirements: {type: 'object'},
        inputs: {type: 'object'},
        outputs: {type: 'object'},
        adapter: {type: 'object'}
    },
    softwareDescription: {
        repo_owner: {type: 'string'},
        repo_name: {type: 'string'},
        name: {type: 'string'},
        description: {type: 'string'}
    },
    requirements: {
        environment: {type: 'object'},
        resources: {type: 'object'},
        platformFeatures: {type: 'array'}
    },
    environment: {
        container: {type: 'object'}
    },
    container: {
        type: {type: 'string'},
        uri: {type: 'string'},
        imageId: {type: 'string'}
    },
    resources: {
        cpu: {type: 'number'},
        mem: {type: 'number'},
        ports: {type: 'array'},
        diskSpace: {type: 'number'},
        network: {type: 'boolean'}
    },
    inputs: {
        type: {type: 'string'},
        properties: {type: 'object_custom', name: 'inputs'}
    },
    outputs: {
        type: {type: 'string'},
        properties: {type: 'object_custom', name: 'outputs'}
    },
    adapter: {
        properties: {type: 'object_custom', name: 'adapter'}
    },
    properties: {
        inputs: {
            root: {
                required: {type: 'boolean'}
            },
            adapter: {
                order: {type: 'number'},
                transform: {type: 'string'},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            },

            types: {
                file: {
                    adapter: {
                        streamable: {type: 'boolean'}
                    }
                },
                string: {
                    root: {
                        enum: {type: 'array'}
                    }
                },
                integer: {},
                boolean: {},
                array: {
                    adapter: {
                        listSeparator: {type: 'string'},
                        listTransform: {type: 'string'}
                    },
                    root: {
                        minItems: {type: 'number'},
                        maxItems: {type: 'number'},
                        items: {
                            type: {type: 'string'},
                            properties: {type: 'object_custom'}
                        }
                    }
                }
            }
        },
        outputs: {
            root: {
                required: {type: 'boolean'}
            },
            adapter: {
                glob: {type: 'string'}
            },
            types: {
                file: {
                    adapter: {
                        streamable: {type: 'boolean'}
                    }
                },
                directory: {},
                array: {
                    adapter: {
                        listStreamable: {type: 'boolean'}
                    },
                    root: {
                        minItems: {type: 'number'},
                        maxItems: {type: 'number'},
                        items: {
                            type: {type: 'string'}
                        }
                    }
                }
            }
        },
        adapter: {
            root: {
                baseCmd: {type: 'array'},
                stdout: {type: 'string'}
            },
            args: {
                order: {type: 'number'},
                value: {type: 'string'},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            }
        }
    }
};

var validator = {

    validateInputs: function (props, invalid, parent) {

        var self = this;
        var map = mapDefinition.properties.inputs;

        parent = _.isUndefined(parent) ? '' : parent + ':';

        _.each(props, function (prop, propName) {

            _.each(map.root, function (attr, key) {
                if (!_.isUndefined(prop[key]) && typeof prop[key] !== attr.type) {
                    invalid.push('inputs:' + parent + propName + ':' + key);
                }
            });

            _.each(map.adapter, function (attr, key) {
                if (!_.isUndefined(prop.adapter[key]) && typeof prop.adapter[key] !== attr.type) {
                    invalid.push('inputs:' + parent + propName + ':adapter:' + key);
                }
            });

            _.each(map.types[prop.type].root, function (attrRoot, key) {
                if (!_.isUndefined(attrRoot.properties)) {
                    self.validateInputs(prop[key].properties, invalid, propName);
                } else if (attrRoot.type !== 'array' && typeof prop[key] !== attrRoot.type || (attrRoot.type === 'array' && !_.isArray(prop[key]))) {
                    invalid.push('inputs:' + parent + propName + ':' + key);
                }
            });

            _.each(map.types[prop.type].adapter, function (attrAdapter, key) {
                if (!_.isUndefined(prop.adapter[key]) && typeof prop.adapter[key] !== attrAdapter.type) {
                    invalid.push('inputs:' + parent + propName + ':adapter:' + key);
                }
            });
        });
    },

    validateOutputs: function (props, invalid) {

        var map = mapDefinition.properties.outputs;

        _.each(props, function (prop, propName) {

            _.each(map.root, function (attr, key) {
                if (!_.isUndefined(prop[key]) && typeof prop[key] !== attr.type) {
                    invalid.push('outputs:' + propName + ':' + key);
                }
            });

            _.each(map.adapter, function (attr, key) {
                if (!_.isUndefined(prop.adapter[key]) && typeof prop.adapter[key] !== attr.type) {
                    invalid.push('outputs:' + propName + ':adapter:' + key);
                }
            });

            _.each(map.types[prop.type].root, function (attrRoot, key) {
                if (typeof prop[key] !== attrRoot.type) {
                    invalid.push('outputs:' + propName + ':' + key);
                }
            });

            _.each(map.types[prop.type].adapter, function (attrAdapter, key) {
                if (!_.isUndefined(prop.adapter[key]) && typeof prop.adapter[key] !== attrAdapter.type) {
                    invalid.push('outputs:' + propName + ':adapter:' + key);
                }
            });
        });
    },

    validateAdapter: function (adapter, invalid) {

        var map = mapDefinition.properties.adapter;

        _.each(map.root, function (attr, key) {
            if (attr.type !== 'array' && typeof adapter[key] !== attr.type || (attr.type === 'array' && !_.isArray(adapter[key]))) {
                invalid.push('adapter:' + key);
            }
        });

        _.each(adapter.args, function (arg, index) {
            _.each(map.args, function (attr, key) {
                if (!_.isUndefined(arg[key]) && typeof arg[key] !== attr.type) {
                    invalid.push('adapter:arg[' + index + ']:' + key);
                }
            });
        });

    },

    validateApp: function (json, map, invalid, parent) {

        var self = this;
        if (_.isUndefined(invalid)) { invalid = []; }
        if (_.isUndefined(map)) { map = mapDefinition.root; }

        parent = _.isUndefined(parent) ? '' : parent + ':';

        _.each(map, function (attr, key) {

            if (attr.type === 'object_custom') {
                if (attr.name === 'inputs') {
                    self.validateInputs(json.properties, invalid);
                }
                if (attr.name === 'outputs') {
                    self.validateOutputs(json.properties, invalid);
                }
                if (attr.name === 'adapter') {
                    self.validateAdapter(json, invalid);
                }
            } else {
                if (attr.type !== 'array' && typeof json[key] !== attr.type || (attr.type === 'array' && !_.isArray(json[key]))) {
                    invalid.push(parent + key);
                }

                if (attr.type === 'object') {
                    if (!_.isUndefined(mapDefinition[key])) {
                        self.validateApp(json[key], mapDefinition[key], invalid, key);
                    }
                }
            }
        });

        return invalid;
    }
};

// TODO: validate required inputs
// TODO: validate required outputs
// TODO: validate obsolite properties (maybe?)

module.exports = validator;