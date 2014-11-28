/**
 * Created by milica on 9/12/14.
 */
'use strict';

var _ = require('lodash');

var mapDefinition = {
    root: {
        name: {type: 'string', required: true},
        description: {type: 'string'},
        documentAuthor: {type: 'string', required: true},
        softwareRelease: {type: 'object'},
        requirements: {type: 'object', required: true},
        inputs: {type: 'object', required: true},
        outputs: {type: 'object', required: true},
        adapter: {type: 'object', required: true}
    },
    softwareDescription: {
        repo_owner: {type: 'string', required: true},
        repo_name: {type: 'string', required: true},
        name: {type: 'string', required: true},
        description: {type: 'string'},
        appVersion: {type: 'string'}
    },
    requirements: {
        environment: {type: 'object', required: true},
        resources: {type: 'object', required: true},
        platformFeatures: {type: 'array'}
    },
    environment: {
        container: {type: 'object', required: true}
    },
    container: {
        type: {type: 'string', required: true},
        uri: {type: 'string'},
        imageId: {type: 'string'}
    },
    resources: {
        cpu: {type: ['number', 'object']},
        mem: {type: ['number', 'object']},
        ports: {type: 'array'}
    },
    inputs: {
        type: {type: 'string', required: true},
        properties: {type: 'object_custom', name: 'inputs', required: true}
    },
    outputs: {
        type: {type: 'string', required: true},
        properties: {type: 'object_custom', name: 'outputs', required: true}
    },
    adapter: {
        baseCmd: {type: 'array', required: true},
        stdin: {type: ['string', 'object'], required: true},
        stdout: {type: ['string', 'object'], required: true},
        args: {type: 'object_custom', name: 'adapter', required: true},
        environment: {type: 'object'}
    },
    properties: {
        inputs: {
            root: {
                required: {type: 'boolean'},
                type: {type: 'string', required: true},
                adapter: {type: 'object'}
            },
            adapter: {
                stdin: {type: 'boolean'},
                order: {type: 'number'},
                transform: {type: 'object'},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            },

            types: {
                file: {
                    root: {},
                    adapter: {
                        streamable: {type: 'boolean'},
                        secondaryFiles: {type: 'array'}
                    }
                },
                string: {
                    root: {
                        enum: {type: 'array'}
                    },
                    adapter: {}
                },
                integer: {
                    root: {},
                    adapter: {}
                },
                number: {
                    root: {},
                    adapter: {}
                },
                boolean: {
                    root: {},
                    adapter: {}
                },
                array: {
                    root: {
                        minItems: {type: 'number'},
                        maxItems: {type: 'number'},
                        items: {type: 'object', required: true}
                    },
                    adapter: {
                        listSeparator: {type: 'string'},
                        listTransform: {type: 'object'},
                        listStreamable: {type: 'boolean'}
                    },
                    items: {
                        type: {type: 'string', required: true},
                        properties: {type: 'object_custom', required: true}
                    }
                }
            }
        },
        outputs: {
            root: {
                required: {type: 'boolean'},
                type: {type: 'string', required: true},
                adapter: {type: 'object', required: true}
            },
            adapter: {
                stdout: {type: 'boolean'},
                glob: {type: 'object'},
                secondaryFiles: {type: 'array'},
                meta: {type: 'object'}
            },
            types: {
                file: {
                    root: {},
                    adapter: {
                        streamable: {type: 'boolean'}
                    }
                },
                directory: {
                    root: {},
                    adapter: {}
                },
                array: {
                    root: {
                        minItems: {type: 'number'},
                        maxItems: {type: 'number'},
                        items: {type: 'object', required: true}
                    },
                    adapter: {
                        listStreamable: {type: 'boolean'}
                    },
                    items: {
                        type: {type: 'string', required: true}
                    }
                }
            }
        },
        adapter: {
            args: {
                order: {type: 'number'},
                value: {type: ['string', 'number', 'object'], required: true},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            }
        }
    }
};

var validator = function() {

    /**
     * Nodes with invalid value type
     */
    var invalid = [];

    /**
     * Nodes that are not defined by the scheme map
     */
    var obsolete = {};

    /**
     * Nodes that are missing and are required by the scheme map
     */
    var required = [];

    var clear = function () {
        invalid = [];
        obsolete = {};
        required = [];
    };

    /**
     * Check if value type of the node is correct
     *
     * @param {*} value
     * @param {*} types
     * @returns {boolean}
     */
    var isValidType = function (value, types) {

        var isValidTypeLocal = function (value, type) {
            if (type === 'array') {
                return _.isArray(value);
            }
            return typeof value === type;
        };

        if (_.isArray(types)) {

            var valid = _.find(types, function (type) {
                return isValidTypeLocal(value, type);
            });

            return !_.isUndefined(valid);

        }

        return isValidTypeLocal(value, types);

    };

    /**
     * Set obsolete keys defined by the scheme map
     *
     * @param values
     * @param map
     * @returns {*}
     */
    var setObsolete = function (prefix, values, map) {

        var keys = [];

        if (_.isArray(map)) {
            _.each(map, function (child) {
                keys = keys.concat(_.keys(child));
            });
        } else {
            keys = _.keys(map);
        }

        var diff = _.difference(_.keys(values), keys);

        if (diff.length > 0) {
            obsolete[prefix] = diff;
        }

    };

    /**
     * Set required and invalid nodes defined by the scheme map
     *
     * @param {string} prefix
     * @param {Object} map
     * @param {Object} prop
     * @param {string} propName
     * @param {string} recursionFn
     */
    var setRequiredAndInvalid = function (prefix, map, prop, /* optional */ propName, /* optional */ isRecursive) {

        _.each(map, function (attr, key) {

            if (prop) {
                if (_.isUndefined(prop[key])) {
                    if (attr.required) {
                        required.push(prefix + ':' + key);
                    }
                } else {
                    if (!isValidType(prop[key], attr.type)) {
                        invalid.push(prefix + ':' + key);
                    }

                    if (attr.type === 'object' && isRecursive) {

                        validateInputs(prop[key].properties, propName);

                    } else if (!isValidType(prop[key], attr.type)) {

                        invalid.push(prefix + ':' + key);

                    }
                }
            }

        });

    };

    /**
     * Validate adapter
     *
     * @param {Object} adapter
     */
    var validateAdapter = function (adapter) {

        var map = mapDefinition.properties.adapter;
        var prefix;

        _.each(map.root, function (attr, key) {
            if (!isValidType(adapter[key], attr.type)) {
                invalid.push('adapter:' + key);
            }
        });

        _.each(adapter.args, function (arg, index) {

            prefix = 'adapter:arg[' + index + ']';

            setObsolete(prefix, arg, map.args);

            setRequiredAndInvalid(prefix, map.args, arg);
        });

    };

    /**
     * Validate output nodes
     *
     * @param {Object} props
     */
    var validateOutputs = function (props) {

        var map = mapDefinition.properties.outputs;
        var prefixRoot;
        var prefixAdapter;

        _.each(props, function (prop, propName) {

            prefixRoot = 'outputs:' + propName;
            prefixAdapter = 'outputs:' + propName + ':adapter';

            setRequiredAndInvalid(prefixRoot, map.root, prop);
            setRequiredAndInvalid(prefixAdapter, map.adapter, prop.adapter);

            if (!_.isUndefined(prop.type)) {

                setObsolete(prefixRoot, prop, [map.root, map.types[prop.type].root]);
                setObsolete(prefixAdapter, prop.adapter, [map.adapter, map.types[prop.type].adapter]);

                setRequiredAndInvalid(prefixRoot, map.types[prop.type].root, prop);
                setRequiredAndInvalid(prefixAdapter, map.types[prop.type].adapter, prop.adapter);
            }
        });
    };

    /**
     * Validate input nodes
     *
     * @param {Object} props
     * @param {string} parent
     */
    var validateInputs = function (props, /* optional */ parent) {

        var map = mapDefinition.properties.inputs;
        var prefixRoot;
        var prefixAdapter;

        parent = _.isUndefined(parent) ? '' : parent + ':';

        _.each(props, function (prop, propName) {

            prefixRoot = 'inputs:' + parent + propName;
            prefixAdapter = 'inputs:' + parent + propName + ':adapter';

            setRequiredAndInvalid(prefixRoot, map.root, prop);
            setRequiredAndInvalid(prefixAdapter, map.adapter, prop.adapter);

            if (!_.isUndefined(prop.type)) {

                setObsolete(prefixRoot, prop, [map.root, map.types[prop.type].root]);
                setObsolete(prefixAdapter, prop.adapter, [map.adapter, map.types[prop.type].adapter]);

                setRequiredAndInvalid(prefixRoot, map.types[prop.type].root, prop, propName, true);
                setRequiredAndInvalid(prefixAdapter, map.types[prop.type].adapter, prop.adapter);
            }
        });
    };

    return {

        /**
         * Validate app's json
         *
         * @param {Object} json
         * @param {Object} map
         * @param {string} parent
         * @returns {{invalid: *, obsolete: *, required: *}}
         */
        validate: function (json, map, /* optional */ parent) {

            var self = this;

            if (_.isUndefined(map)) {
                map = mapDefinition.root;
                clear();
            }

            parent = _.isUndefined(parent) ? '' : parent + ':';

            setObsolete(parent + 'root', json, map);

            _.each(map, function (attr, key) {

                if (attr.type === 'object_custom') {
                    if (attr.name === 'inputs') {
                        validateInputs(json.properties);
                    }
                    if (attr.name === 'outputs') {
                        validateOutputs(json.properties);
                    }
                    if (attr.name === 'adapter') {
                        validateAdapter(json);
                    }
                } else {

                    if (_.isUndefined(json[key])) {
                        if (attr.required) {
                            required.push(parent + key);
                        }
                    } else {
                        if (!isValidType(json[key], attr.type)) {
                            invalid.push(parent + key);
                        }
                        if (attr.type === 'object') {
                            if (!_.isUndefined(mapDefinition[key])) {
                                self.validate(json[key], mapDefinition[key], key);
                            }
                        }
                    }

                }
            });

            var output = {};

            if (!_.isEmpty(invalid)) {
                output.invalid = _.cloneDeep(invalid);
            }
            if (!_.isEmpty(obsolete)) {
                output.obsolete = _.cloneDeep(obsolete);
            }
            if (!_.isEmpty(required)) {
                output.required = _.cloneDeep(required);
            }

//            return output;
            //TODO: Test validation and uncomment line above
            return {};
        }
    };
}();

module.exports = validator;