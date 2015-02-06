/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:33 PM
 */
'use strict';
angular.module('registryApp.cliche')
    .factory('Cliche', ['$q', '$localForage', 'rawTool', 'rawJob', 'rawTransform', function($q, $localForage, rawTool, rawJob, rawTransform) {

        /**
         * Version of the storage
         *
         * @type {number}
         */
        var version = 0;

        /**
         * Tool json object
         *
         * @type {object}
         */
        var toolJSON = {};

        /**
         * Job json object
         *
         * @type {object}
         */
        var jobJSON = {};

        /**
         * Command generated from input and adapter values
         *
         * @type {string}
         */
        var command = '';

        /**
         * Get scheme for the input and output
         *
         * @type {object}
         */
//        var getMap = function() {
//
//            var map = {
//                input: {
//                    file: {
//                        root: {
//                            type: 'string'
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
//                    },
//                    string: {
//                        root: {
//                            type: 'string',
//                            enum: null
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
//                    },
//                    integer: {
//                        root: {
//                            type: 'string'
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
//                    },
//                    number: {
//                        root: {
//                            type: 'string'
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
//                    },
//                    array: {
//                        root: {
//                            type: 'string',
//                            items: {type: 'string'}
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null, itemSeparator: ','}
//                    },
//                    boolean: {
//                        root: {
//                            type: 'string'
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
//                    },
//                    object: {
//                        root: {
//                            type: 'string',
//                            properties: []
//                        },
//                        adapter: {prefix: '', separator: ' ', position: 0}
//                    }
//                },
//                output: {
//                    file: {
//                        root: {
//                            type: 'string'
//                        },
//                        adapter: {glob: '', metadata: {}, secondaryFiles: []}
//                    },
//                    directory: {
//                        root: {
//                            type: 'string'
//                        },
//                        adapter: {glob: '', metadata: {}, secondaryFiles: []}
//                    },
//                    array: {
//                        root: {
//                            type: 'string',
//                            items: {type: 'file'}
//                        },
//                        adapter: {glob: '', metadata: {}, secondaryFiles: []}
//                    }
//                }
//            };
//
//            return map;
//        };

        /**
         * Get available types for inputs and outputs
         *
         * @param {string} type - available 'input', 'output', 'inputItem' and 'outputItem'
         * @returns {*}
         */
        var getTypes = function(type) {

            var map = {
                input: ['file', 'string', 'enum', 'int', 'float', 'boolean', 'array'],
                output: ['file', 'array'],
                inputItem: ['string', 'int', 'float', 'file', 'record'],
                outputItem: ['file']
            };

            return map[type] || [];

        };

        /**
         * Check if old version of structure and if yes clean up the storage
         *
         * @returns {*}
         */
        var checkVersion = function() {

            return $localForage.getItem('version')
                .then(function(v) {

                    if (v === version) {
                        return false;
                    } else {
                        return $q.all([
                            $localForage.setItem('version', version),
                            $localForage.setItem('tool', rawTool),
                            $localForage.setItem('job', rawJob)
                        ]);
                    }
                });

        };

        /**
         * Transform tool json into appropriate structure
         *
         * @param {String} type
         * @param {Object} json
         */
        var transformToolJson = function(type, json) {

            var transformed = angular.copy(json);

            if (type === 'script') {

                transformed.transform = getTransformSchema();
                delete transformed.cliAdapter;
                delete transformed.requirements;

            } else {

                delete transformed.transform;

                if (angular.isUndefined(transformed.cliAdapter)) {
                    transformed.cliAdapter = angular.copy(rawTool.cliAdapter);
                }
                if (angular.isUndefined(transformed.requirements)) {
                    transformed.requirements = angular.copy(rawTool.requirements);
                }
            }

            return transformed;

        };

        /**
         * Fetch tool and job from local db if exist
         *
         * @param {String} type
         * @returns {*}
         */
        var fetchLocalToolAndJob = function (type) {

            var deferred = $q.defer();

            $q.all([
                    $localForage.getItem('tool'),
                    $localForage.getItem('job')
                ]).then(function (result) {

                    toolJSON = transformToolJson(type, result[0]);
                    jobJSON = result[1];

                    deferred.resolve();
                });

            return deferred.promise;
        };

        /**
         * Set current tool
         *
         * @param t
         * @param preserve
         */
        var setTool = function(t, preserve) {

            var deferred = $q.defer();

            t = t || rawTool;

            toolJSON = angular.copy(t);

            if (preserve) {
                $localForage.setItem('tool', toolJSON)
                    .then(function() {
                        deferred.resolve();
                    });
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        /**
         * Set current job
         *
         * @param j
         * @param preserve
         */
        var setJob = function(j, preserve) {

            var deferred = $q.defer();

            j = j || rawJob;

            jobJSON = angular.copy(j);

            if (preserve) {
                $localForage.setItem('job', jobJSON)
                    .then(function() {
                        deferred.resolve();
                    });
            } else {
                deferred.resolve();
            }

            return deferred.promise;

        };

        /**
         * Get current tool
         *
         * @returns {Object}
         */
        var getTool = function() {

            return toolJSON;

        };

        /**
         * Get current job
         *
         * @returns {Object}
         */
        var getJob = function() {

            return jobJSON;

        };

        /**
         * Cleanup the local db and prepare fresh cliche vars
         *
         * @param {Boolean} preserve
         * @param {String} type
         * @param {String} label
         * @returns {Promise}
         */
        var flush = function(preserve, type, label) {

            command = '';

            var tool = transformToolJson(type, rawTool);
            tool.label = label;

            return $q.all([setTool(tool, preserve), setJob(null, preserve)]);

        };

        /**
         * Get schema for transformation
         *
         * @returns {*}
         */
        var getTransformSchema = function() {

            return angular.copy(rawTransform);

        };

        /**
         * Check if id/name exists
         * - if "@id" then both inputs and outputs need to be checked
         * - if "name" then only current level is checked
         *
         * @param {object} prop
         * @param {array} properties
         * @returns {*}
         */
        var checkIfIdExists = function(prop, properties) {

            var exists;
            var idName;
            var ids;
            var deferred = $q.defer();

            if (prop['@id']) {

                ids = [
                    [toolJSON['@id']],
                    _.pluck(toolJSON.inputs, '@id'),
                    _.pluck(toolJSON.outputs, '@id')
                ];

                ids = _.reduce(ids, function(fl, a) { return fl.concat(a); }, []);

                idName = 'id';
                exists = _.contains(ids, prop['@id']);
            } else {
                idName = 'name';
                exists = _.find(properties, {'name': prop.name});
            }

            if (exists) {
                deferred.reject('Choose another ' + idName + ', the one already exists');
            } else {
                deferred.resolve();
            }

            return deferred.promise;

        };

        /**
         * Manage input or output property - add or edit mode
         *
         * @param {string} mode
         * @param {object} prop
         * @param {array} properties
         * @param {object} idObj - contains new and old name of the property
         * @returns {*}
         */
        var manageProperty = function(mode, prop, properties, idObj) {

            var deferred = $q.defer();

            if (mode === 'edit') {

                if (idObj.n !== idObj.o) {

                    checkIfIdExists(prop, properties)
                        .then(function() {
                            deferred.resolve();
                        }, function(error) {
                            deferred.reject(error);
                        });

                } else {
                    deferred.resolve();
                }

            } else if (mode === 'add') {

                checkIfIdExists(prop, properties)
                    .then(function() {
                        properties.push(prop);
                        deferred.resolve();
                    }, function(error) {
                        deferred.reject(error);
                    });

            } else {
                deferred.reject('Unknown mode "' + mode + '"');
            }

            return deferred.promise;
        };

        /**
         * Manage argument property  - add or edit mode
         *
         * @param {string} mode
         * @param {object} arg
         * @returns {*}
         */
        var manageArg = function(mode, arg) {

            var deferred = $q.defer();

            if (mode === 'edit') {
                deferred.resolve();
            } else if (mode === 'add') {
                toolJSON.cliAdapter.argAdapters.push(arg);
                deferred.resolve();
            } else {
                deferred.reject('Unknown mode "' + mode + '"');
            }

            return deferred.promise;

        };


        /**
         * Delete property from the object
         *
         * @param {string} key
         * @param {string} index
         * @param {array} properties
         */
        var deleteProperty = function(key, index, properties) {

            var cmp = key === '@id' ? '#' + index : index;

            _.remove(properties, function(prop) {
                return prop[key] === cmp;
            });

        };

        /**
         * Delete argument property from cliAdapter
         *
         * @param {integer} index
         */
        var deleteArg = function(index) {

            toolJSON.cliAdapter.argAdapters.splice(index, 1);

        };

        /**
         * Extract type literal
         *
         * @param {*} type
         * @returns {*}
         */
        var parseType = function(type) {

            var parse = function(t) {
                return (t && t.type) ? t.type : t;
            };

            if (_.isString(type)) {
                return type;
            } else if (_.isArray(type)) {
                return parse(type[1]);
            } else {
                return parse(type);
            }

        };

        /**
         * Extract type original object
         *
         * @param {*} type
         * @returns {*}
         */
        var parseTypeObj = function(type) {

            return _.isArray(type) ? type[1] : type;

        };

        /**
         * Extract enum symbols and name if available
         *
         * @param t
         * @returns {*}
         */
        var parseEnum = function(t) {

            var type = parseTypeObj(t);

            if (type.type === 'enum') {

                return {name: type.name, symbols: type.symbols || ['']};

            } else {
                return {name: null, symbols: null};
            }

        };

        /**
         * Parse property name
         *
         * @param {string} key
         * @param {Object} property
         * @returns {*}
         */
        var parseName = function(key, property) {

            if (_.isUndefined(property)) {
                return '';
            }

            if (key === '@id') {
                return property['@id'] ? property['@id'].slice(1) : '';
            } else {
                return property.name;
            }

        };

        var generateCommand = function() {

        };

        /**
         * Check if property is required
         *
         * @param type
         * @returns {Boolean}
         */
        var isRequired = function(type) {

            return _.isArray(type) && type.length > 1 && type[0] === 'null';

        };

        /**
         * Format property according to avro schema
         *
         * @param {object} inner
         * @param {object} property
         * @returns {object}
         */
        var formatProperty = function(inner, property) {

            var type;
            var formatted = {};
            var tmp = angular.copy(property);

            /**
             * Strip obsolete params for record array item
             *
             * @param {object} prop
             * @param {string} itemType
             */
            var stripParams = function(prop, itemType) {

                var toStrip = ['prefix', 'separator', 'itemSeparator', 'argValue'];

                if (itemType === 'record' && prop.adapter) {

                    _.each(toStrip, function(param) {
                        if (angular.isDefined(prop.adapter[param])) {
                            delete prop.adapter[param];
                        }
                    });
                }

            };

            /* if first level and array */
            if (inner.key === '@id' && inner.type === 'array') {

                type = 'array';
                tmp.items = inner.items;

                stripParams(tmp, tmp.items.type);


            /* if not first level and array */
            } else if (inner.key === 'name' && inner.type === 'array') {

                type = {
                    type: 'array',
                    items: inner.items
                };

                stripParams(tmp, type.items.type);

            /* if any level and enum */
            } else if (inner.type === 'enum') {

                type = {
                    type: 'enum',
                    name: inner.enumName,
                    symbols: inner.symbols
                };

            /* every other case */
            } else {
                type = inner.type;
            }

            /* format structure for required property */
            if (inner.required) {
                tmp.type = ['null', type];
            } else {
                tmp.type = type;
            }

            /* schema for the first level */
            if (inner.key === '@id') {

                formatted['@id'] = '#' + inner.name;
                formatted.depth = inner.type === 'array' ? 1 : 0;
                formatted.schema = tmp;

            /* schema for every other level */
            } else {
                formatted = tmp;
                formatted.name = inner.name;
            }

            return formatted;

        };

        /**
         * Copy property's params in order to preserve reference
         *
         * @param src
         * @param dest
         */
        var copyPropertyParams = function(src, dest) {

            var keys = _.keys(src);

            _.each(src, function(value, key) {
                dest[key] = value;
            });

            _.each(dest, function(value, key) {
                if (!_.contains(keys, key)) {
                    delete dest[key];
                }
            });

        };

        /**
         * Get property template name by its type
         *
         * @param {string} type
         * @returns {*}
         */
        var getTplType = function(type) {

            var general = ['file', 'string', 'int', 'float', 'boolean'];

            if (_.contains(general, type)) {
                return 'general';
            } else {
                return type;
            }

        };

        /**
         * Get reference for items
         *
         * @param {string} key - available '@id' and 'name'
         * @param {string} type
         * @param {Object} property
         * @returns {*}
         */
        var getItemsRef = function(key, type, property) {

            if (type === 'array') {

                if (key === '@id') {
                    return property.items;
                } else {
                    return property.type.items;
                }
            } else {
                return null;
            }

        };

        /**
         * Get property schema depending on the level
         *
         * @param {object} type - input or output
         * @param {object} property
         * @param {string} toolType - tool or script
         * @param {boolean} ref
         * @returns {*}
         */
        var getSchema = function(type, property, toolType, ref) {

            var defaultTypes = {
                input: 'string',
                output: 'file'
            };

            if (_.isEmpty(property)) {
                return (toolType === 'tool') ? {type: defaultTypes[type], adapter: {}} : {type: defaultTypes[type]};
            }

            if (_.isUndefined(property.schema)) {
                return ref ? property : angular.copy(property);
            } else {
                return ref ? property.schema : angular.copy(property.schema);
            }

        };

        return {
            checkVersion: checkVersion,
            fetchLocalToolAndJob: fetchLocalToolAndJob,
            setTool: setTool,
            setJob: setJob,
            getTool: getTool,
            getJob: getJob,
            flush: flush,
            getTransformSchema: getTransformSchema,
            deleteProperty: deleteProperty,
            generateCommand: generateCommand,
            isRequired: isRequired,
            parseType: parseType,
            parseEnum: parseEnum,
            parseName: parseName,
            formatProperty: formatProperty,
            copyPropertyParams: copyPropertyParams,
            getTplType: getTplType,
            getItemsRef: getItemsRef,
            getTypes: getTypes,
            getSchema: getSchema,
            checkIfIdExists: checkIfIdExists,
            manageProperty: manageProperty,
            manageArg: manageArg,
            deleteArg: deleteArg
        };

    }]);
