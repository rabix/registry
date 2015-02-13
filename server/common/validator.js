/**
 * Created by milica on 9/12/14.
 */
'use strict';

var _ = require('lodash');

var mapDefinition = {
    root: {
        '@id': {type: 'string'},
        '@type': {type: 'string'},
        '@context': {type: 'string'},
        label: {type: 'string', required: true},
        description: {type: 'string'},
        owner: {type: 'array', required: true},
        contributor: {type: 'array'},
        requirements: {type: 'array'},
        inputs: {type: 'object_custom', name: 'inputs', required: true},
        outputs: {type: 'object_custom', name: 'outputs', required: true},
        cliAdapter: {type: 'object'},
        transform: {type: 'string'}
    },
    //inputs: {type: 'object_custom', name: 'inputs', required: true},
    //outputs: {type: 'object_custom', name: 'outputs', required: true},
    cliAdapter: {
        baseCmd: {type: ['string', 'array'], required: true},
        stdin: {type: ['string', 'object']},
        stdout: {type: ['string', 'object']},
        argAdapters: {type: 'object_custom', name: 'adapter', required: true}
    },
    properties: {
        inputs: {
            root: {
                type: {type: 'string', required: true},
                adapter: {type: 'object'}
            },
            adapter: {
                position: {type: 'number'},
                argValue: {type: 'object'},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            },

            types: {
                file: {
                    root: {},
                    adapter: {}
                },
                string: {
                    root: {},
                    adapter: {}
                },
                'enum': {
                    root: {},
                    adapter: {}
                },
                int: {
                    root: {},
                    adapter: {}
                },
                float: {
                    root: {},
                    adapter: {}
                },
                boolean: {
                    root: {},
                    adapter: {}
                },
                array: {
                    root: {
                        items: {type: 'object', required: true}
                    },
                    adapter: {
                        itemSeparator: {type: ['string', 'object']} // separator can be null which is type of object
                    },
                    items: {
                        type: {type: 'string', required: true},
                        fields: {type: 'object_custom'}
                    }
                }
            }
        },
        outputs: {
            root: {
                '@id': {type: 'string', required: true},
                depth: {type: 'number', required: true},
                schema: {type: 'object', required: true}
            },
            schema: {
                type: {type: ['string', 'array', 'object'], required: true},
                adapter: {type: 'object'}
            },
            adapter: {
                glob: {type: ['object', 'string']}
            }
//            root: {
//                type: {type: 'string', required: true},
//                adapter: {type: 'object'}
//            },
//            adapter: {
//                glob: {type: ['object', 'string']}
//            },
//            types: {
//                file: {
//                    root: {},
//                    adapter: {}
//                },
//                array: {
//                    root: {
//                        items: {type: 'object', required: true}
//                    },
//                    adapter: {},
//                    items: {
//                        type: {type: 'string', required: true}
//                    }
//                }
//            }
        },
        adapter: {
            argAdapters: {
                position: {type: 'number'},
                argValue: {type: ['string', 'number', 'object'], required: true},
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

                        validateInputs(prop[key].fields, propName);

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

        _.each(adapter.argAdapters, function (arg, index) {

            prefix = 'adapter:arg[' + index + ']';

            setObsolete(prefix, arg, map.argAdapters);

            setRequiredAndInvalid(prefix, map.argAdapters, arg);
        });

    };

    /**
     * Validate output nodes
     *
     * @param {Object} json
     */
    var validateOutputs = function (json) {

        var map = mapDefinition.properties.outputs;
        var prefixRoot;
        var prefixSchema;
        var prefixAdapter;

        var schema, adapter;

        _.each(json.outputs, function (prop) {

            prefixRoot = 'outputs:' + prop['@id'];
            prefixSchema = 'outputs:' + prop['@id'] + ':schema';
            prefixAdapter = 'outputs:' + prop['@id'] + ':schema:adapter';

            schema = prop.schema;
            adapter = schema ? schema.adapter : null;

            setRequiredAndInvalid(prefixRoot, map.root, prop);
            setRequiredAndInvalid(prefixSchema, map.schema, schema);
            setRequiredAndInvalid(prefixAdapter, map.adapter, adapter);

//            if (!_.isUndefined(prop.type)) {
//
//                setObsolete(prefixRoot, prop, [map.root, map.types[prop.type].root]);
//                setObsolete(prefixSchema, prop.schema, [map.schema, map.types[prop.type].schema]);
//                setObsolete(prefixAdapter, prop.schema.adapter, [map.schema.adapter, map.types[prop.type].schema.adapter]);
//
//                setRequiredAndInvalid(prefixRoot, map.types[prop.type].root, prop);
//                setRequiredAndInvalid(prefixSchema, map.types[prop.type].schema, prop.schema);
//                setRequiredAndInvalid(prefixAdapter, map.types[prop.type].schema.adapter, prop.schema.adapter);
//            }
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
         * Validate tools's json
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
                        //validateInputs(json.inputs);
                    }
                    if (attr.name === 'outputs') {
                        validateOutputs(json);
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

            return output;
//            return {};
        }
    };
}();

module.exports = validator;