/**
 * Created by milica on 9/12/14.
 */
'use strict';

var _ = require('lodash');

var mapDefinition = {
    root: {
        softwareDescription: {type: 'object', required: true},
        documentAuthor: {type: 'string', required: true},
        requirements: {type: 'object', required: true},
        inputs: {type: 'object'},
        outputs: {type: 'object'},
        adapter: {type: 'object'}
    },
    softwareDescription: {
        repo_owner: {type: 'string', required: true},
        repo_name: {type: 'string', required: true},
        name: {type: 'string', required: true},
        description: {type: 'string'}
    },
    requirements: {
        environment: {type: 'object', required: true},
        resources: {type: 'object', required: true},
        platformFeatures: {type: 'array', required: true}
    },
    environment: {
        container: {type: 'object', required: true}
    },
    container: {
        type: {type: 'string', required: true},
        uri: {type: 'string', required: true},
        imageId: {type: 'string', required: true}
    },
    resources: {
        cpu: {type: 'number', required: true},
        mem: {type: 'number', required: true},
        ports: {type: 'array'},
        diskSpace: {type: 'number', required: true},
        network: {type: 'boolean', required: true}
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
        stdout: {type: 'string', required: true},
        args: {type: 'object_custom', name: 'adapter', required: true}
    },
    properties: {
        inputs: {
            root: {
                required: {type: 'boolean'},
                type: {type: 'string', required: true},
                adapter: {type: 'object'}
            },
            adapter: {
                order: {type: 'number'},
                transform: {type: 'string'},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            },

            types: {
                file: {
                    root: {},
                    adapter: {
                        streamable: {type: 'boolean'}
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
                        listTransform: {type: 'string'},
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
                glob: {type: 'string'}
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
                value: {type: ['string', 'number'], required: true},
                valueFrom: {type: ['string', 'number']},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            }
        }
    }
};

var validator = {

    /**
     * Nodes with invalid value type
     */
    invalid: [],
    /**
     * Nodes that are not defined by the scheme map
     */
    obsolete: {},
    /**
     * Nodes that are missing and are required by the scheme map
     */
    required: [],

    clear: function () {
        this.invalid = [];
        this.obsolete = {};
        this.required = [];
    },

    /**
     * Check if value type of the node is correct
     *
     * @param {*} value
     * @param {*} types
     * @returns {boolean}
     */
    isValidType: function (value, types) {

        var isValidType = function (value, type) {
            if (type === 'array') {
                return _.isArray(value);
            }
            return typeof value === type;
        };

        if (_.isArray(types)) {

            var valid = _.find(types, function (type) {
                return isValidType(value, type);
            });

            return !_.isUndefined(valid);

        }

        return isValidType(value, types);

    },

    /**
     * Set obsolete keys defined by the scheme map
     *
     * @param values
     * @param map
     * @returns {*}
     */
    setObsolete: function (prefix, values, map) {

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
            this.obsolete[prefix] = diff;
        }

    },

    /**
     * Set required and invalid nodes defined by the scheme map
     *
     * @param {string} prefix
     * @param {Object} map
     * @param {Object} prop
     * @param {string} propName
     * @param {string} recursionFn
     */
    setRequiredAndInvalid: function (prefix, map, prop, /* optional */ propName, /* optional */ recursionFn) {

        var self = this;

        _.each(map, function (attr, key) {

            if (_.isUndefined(prop[key])) {
                if (attr.required) {
                    self.required.push(prefix + ':' + key);
                }
            } else {
                if (!self.isValidType(prop[key], attr.type)) {
                    self.invalid.push(prefix + ':' + key);
                }

                if (attr.type === 'object' && recursionFn) {

                    self[recursionFn](prop[key].properties, propName);

                } else if (!self.isValidType(prop[key], attr.type)) {

                    self.invalid.push(prefix + ':' + key);

                }
            }

        });

    },

    /**
     * Validate input nodes
     *
     * @param {Object} props
     * @param {string} parent
     */
    validateInputs: function (props, /* optional */ parent) {

        var self = this;
        var map = mapDefinition.properties.inputs;
        var prefixRoot;
        var prefixAdapter;

        parent = _.isUndefined(parent) ? '' : parent + ':';

        _.each(props, function (prop, propName) {

            prefixRoot = 'inputs:' + parent + propName;
            prefixAdapter = 'inputs:' + parent + propName + ':adapter';

            self.setRequiredAndInvalid(prefixRoot, map.root, prop);
            self.setRequiredAndInvalid(prefixAdapter, map.adapter, prop.adapter);

            if (!_.isUndefined(prop.type)) {

                self.setObsolete(prefixRoot, prop, [map.root, map.types[prop.type].root]);
                self.setObsolete(prefixAdapter, prop.adapter, [map.adapter, map.types[prop.type].adapter]);

                self.setRequiredAndInvalid(prefixRoot, map.types[prop.type].root, prop, propName, 'validateInputs');
                self.setRequiredAndInvalid(prefixAdapter, map.types[prop.type].adapter, prop.adapter);
            }
        });
    },

    /**
     * Validate output nodes
     *
     * @param {Object} props
     */
    validateOutputs: function (props) {

        var self = this;
        var map = mapDefinition.properties.outputs;
        var prefixRoot;
        var prefixAdapter;

        _.each(props, function (prop, propName) {

            prefixRoot = 'outputs:' + propName;
            prefixAdapter = 'outputs:' + propName + ':adapter';

            self.setRequiredAndInvalid(prefixRoot, map.root, prop);
            self.setRequiredAndInvalid(prefixAdapter, map.adapter, prop.adapter);

            if (!_.isUndefined(prop.type)) {

                self.setObsolete(prefixRoot, prop, [map.root, map.types[prop.type].root]);
                self.setObsolete(prefixAdapter, prop.adapter, [map.adapter, map.types[prop.type].adapter]);

                self.setRequiredAndInvalid(prefixRoot, map.types[prop.type].root, prop);
                self.setRequiredAndInvalid(prefixAdapter, map.types[prop.type].adapter, prop.adapter);
            }
        });
    },

    /**
     * Validate adapter
     *
     * @param {Object} adapter
     */
    validateAdapter: function (adapter) {

        var self = this;
        var map = mapDefinition.properties.adapter;
        var prefix;

        _.each(map.root, function (attr, key) {
            if (!self.isValidType(adapter[key], attr.type)) {
                self.invalid.push('adapter:' + key);
            }
        });

        _.each(adapter.args, function (arg, index) {

            prefix = 'adapter:arg[' + index + ']';

            self.setObsolete(prefix, arg, map.args);

            self.setRequiredAndInvalid(prefix, map.args, arg);
        });

    },

    /**
     * Validate app's json
     *
     * @param {Object} json
     * @param {Object} map
     * @param {string} parent
     * @returns {{invalid: *, obsolete: *, required: *}}
     */
    validateApp: function (json, map, /* optional */ parent) {

        var self = this;
        if (_.isUndefined(map)) {
            map = mapDefinition.root;
            this.clear();
        }

        parent = _.isUndefined(parent) ? '' : parent + ':';

        self.setObsolete(parent + 'root', json, map);

        _.each(map, function (attr, key) {

            if (attr.type === 'object_custom') {
                if (attr.name === 'inputs') {
                    self.validateInputs(json.properties);
                }
                if (attr.name === 'outputs') {
                    self.validateOutputs(json.properties);
                }
                if (attr.name === 'adapter') {
                    self.validateAdapter(json);
                }
            } else {

                if (_.isUndefined(json[key])) {
                    if (attr.required) { self.required.push(parent + key); }
                } else {
                    if (!self.isValidType(json[key], attr.type)) {
                        self.invalid.push(parent + key);
                    }
                    if (attr.type === 'object') {
                        if (!_.isUndefined(mapDefinition[key])) {
                            self.validateApp(json[key], mapDefinition[key], key);
                        }
                    }
                }

            }
        });

        var output = {};
        if (!_.isEmpty(self.invalid)) { output.invalid = self.invalid; }
        if (!_.isEmpty(self.obsolete)) { output.obsolete = self.obsolete; }
        if (!_.isEmpty(self.required)) { output.required = self.required; }

        return output;
    }
};

module.exports = validator;