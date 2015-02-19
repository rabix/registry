/**
 * Author: Milica Kadic
 * Date: 2/12/15
 * Time: 3:01 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .factory('Validator', ['$q', function($q) {

        /**
         * Schema definition
         *
         * @type {Object}
         */
        var mainDef = {
            '@id': {type: 'string', required: true},
            '@type': {type: 'string', required: true},
            '@context': {type: 'string', required: true},
            label: {type: 'string', required: true},
            description: {type: 'string'},
            owner: {type: 'array', required: true},
            contributor: {type: 'array'},
            requirements: {type: 'array', strict: false, def: {
                '@type': {type: 'string', required: true}
            }},
            inputs: {type: 'array', required: true, def: {
                '@id': {type: 'string', required: true},
                depth: {type: 'number', required: true},
                schema: {type: 'object', required: true, def: {
                    type: {type: ['string', 'array', 'object'], required: true, def: {
                        type: {type: 'string'},
                        name: {type: 'string'},
                        symbols: {type: 'array'}
                    }},
                    adapter: {type: 'object', def: {
                        position: {type: 'number'},
                        argValue: {type: 'object'},
                        separator: {type: 'string'},
                        prefix: {type: 'string'},
                        itemSeparator: {type: ['string', 'object']}
                    }},
                    items: {type: 'object', def: {
                        type: {type: 'string'},
                        fields: {type: 'array', rec: true, def: {
                            name: {type: 'string'},
                            type: {type: ['string', 'array', 'object'], def: {
                                type: {type: 'string'},
                                name: {type: 'string'},
                                symbols: {type: 'array'},
                                items: {type: 'object', def: {
                                    type: {type: 'string'},
                                    fields: {type: 'array'}
                                }}
                            }},
                            adapter: {type: 'object', def: {
                                position: {type: 'number'},
                                argValue: {type: 'object'},
                                separator: {type: 'string'},
                                prefix: {type: 'string'},
                                itemSeparator: {type: ['string', 'object']}
                            }}
                        }}
                    }}
                }}
            }},
            outputs: {type: 'array', required: true, def: {
                '@id': {type: 'string', required: true},
                depth: {type: 'number', required: true},
                schema: {type: 'object', required: true, def: {
                    type: {type: ['string', 'array', 'object'], required: true},
                    adapter: {type: 'object', def: {
                        glob: {type: ['object', 'string']}
                    }},
                    items: {type: 'object', def: {
                        type: {type: 'string'}
                    }}
                }}
            }},
            cliAdapter: {type: 'object', def: {
                baseCmd: {type: ['string', 'array'], required: true},
                stdin: {type: ['string', 'object']},
                stdout: {type: ['string', 'object']},
                argAdapters: {type: 'object', required: true, def: {
                    position: {type: 'number'},
                    argValue: {type: ['string', 'number', 'object'], required: true},
                    separator: {type: 'string'},
                    prefix: {type: 'string'}
                }}
            }},
            transform: {type: 'string'}

        };


        /**
         * Trace object which contains info about required, invalid and obsolete values
         *
         * @type {Object}
         */
        var trace = {};

        /**
         * Prepare trace object
         */
        var prepare = function() {

            trace = {
                obsolete: {},
                required: [],
                invalid: []
            };

        };

        /**
         * Check if value type of the node is correct
         *
         * @param {*} value
         * @param {*} types
         * @returns {boolean}
         */
        var isValidType = function (value, types) {

            var isValid = function (value, type) {
                if (type === 'array') {
                    return _.isArray(value);
                }
                return typeof value === type;
            };

            if (_.isArray(types)) {

                var valid = _.find(types, function (type) {
                    return isValid(value, type);
                });

                return !_.isUndefined(valid);

            }

            return isValid(value, types);

        };

        /**
         * Set obsolete parameters defined in schema
         *
         * @param prefix
         * @param value
         * @param def
         */
        var setObsolete = function (prefix, value, def) {

            var diff = _.difference(_.keys(value), _.keys(def));

            if (diff.length > 0) {
                trace.obsolete[prefix] = diff;
            }

        };

        /**
         * Set required and invalid values
         *
         * @param prefix
         * @param value
         * @param options
         */
        var setRequiredAndInvalid = function (prefix, value, options) {

            if (options.rec && value) {
                var type;
                if (_.isArray(value.type)) {
                    type = value.type[1];
                } else {
                    type = value.type;
                }
                if (_.isObject(type) && type.type === 'array' && type.items && type.items.fields) {
                    validate({
                        json: type.items.fields,
                        parent: prefix,
                        def: options.def,
                        strict: options.def.strict,
                        rec: options.def.rec
                    });
                }
            }

            _.each(options.def, function (attr, key) {

                var val = !_.isNull(value) && !_.isUndefined(value) && !_.isUndefined(value[key]) ? value[key] : undefined;

                if (_.isUndefined(val)) {
                    if (attr.required) {
                        trace.required.push(prefix + ':' + key);
                    }
                } else {
                    if (!isValidType(val, attr.type)) {
                        trace.invalid.push(prefix + ':' + key);
                    }
                }

            });

        };

        /**
         * Get node name
         *
         * @param node
         * @param index
         * @returns {*}
         */
        var getNodeName = function(node, index) {

            if (node['@id']) {
                return node['@id'];
            } else {
                if (node.name) {
                    return node.name;
                } else {
                    return index;
                }
            }

        };

        /**
         * Get next node object
         *
         * @param j
         * @param key
         * @returns {*}
         */
        var getNextNode = function(j, key) {

            return (j && j[key]) ? j[key] : null;

        };

        /**
         * Validate schema recursively
         *
         * @param options
         */
        var validate = function(options) {

            options.strict = _.isUndefined(options.strict) ? true : options.strict;

            if (_.isArray(options.json)) {
                _.each(options.json, function(j, index) {

                    setRequiredAndInvalid(options.parent + '['+ getNodeName(j, index) +']', j, options);

                    if (options.strict) {
                        setObsolete(options.parent + '['+ getNodeName(j, index) +']', j, options.def);
                    }
                });
            } else {
                setRequiredAndInvalid(options.parent, options.json, options);

                if (options.strict) {
                    setObsolete(options.parent, options.json, options.def);
                }
            }

            _.each(options.def, function(def, key) {

                if (def.def) {

                    if (_.isArray(options.json)) {
                        _.each(options.json, function(j, index) {
                            validate({
                                json: getNextNode(j, key),
                                parent: options.parent + ':' + key + '['+ getNodeName(j, index) +']',
                                def: def.def,
                                strict: def.strict,
                                rec: def.rec
                            });
                        });
                    } else {
                        validate({
                            json: getNextNode(options.json, key),
                            parent: options.parent + ':' + key,
                            def: def.def,
                            strict: def.strict,
                            rec: def.rec
                        });
                    }
                }

            });

        };

        /**
         * Init validation
         *
         * @param json
         * @returns {{}}
         */
        var init = function(json) {

            var deferred = $q.defer();

            prepare();

            validate({
                json: json,
                parent: 'root',
                def: mainDef
            });

            if (_.isEmpty(trace.obsolete) && _.isEmpty(trace.required) && _.isEmpty(trace.invalid)) {
                deferred.resolve();
            } else {
                deferred.reject(trace);
            }

            return deferred.promise;

        };

        return {
            validate: init
        };

    }]);