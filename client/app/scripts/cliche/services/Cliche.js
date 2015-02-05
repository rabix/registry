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
        var getMap = function() {

            var map = {
                input: {
                    file: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
                    },
                    string: {
                        root: {
                            type: 'string',
                            enum: null
                        },
                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
                    },
                    integer: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
                    },
                    number: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
                    },
                    array: {
                        root: {
                            type: 'string',
                            items: {type: 'string'}
                        },
                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null, itemSeparator: ','}
                    },
                    boolean: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', position: 0, argValue: null}
                    },
                    object: {
                        root: {
                            type: 'string',
                            properties: []
                        },
                        adapter: {prefix: '', separator: ' ', position: 0}
                    }
                },
                output: {
                    file: {
                        root: {
                            type: 'string'
                        },
                        adapter: {glob: '', metadata: {}, secondaryFiles: []}
                    },
                    directory: {
                        root: {
                            type: 'string'
                        },
                        adapter: {glob: '', metadata: {}, secondaryFiles: []}
                    },
                    array: {
                        root: {
                            type: 'string',
                            items: {type: 'file'}
                        },
                        adapter: {glob: '', metadata: {}, secondaryFiles: []}
                    }
                }
            };

            return map;
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
         * Add new property
         *
         * @param type
         * @param prop
         * @param properties
         */
        var addProperty = function(type, prop, properties) {

            var deferred = $q.defer();

            var exists = prop['@id'] ? _.find(properties, {'@id': prop['@id']}) : false;

            if (exists) {

                deferred.reject('Choose another name, the one already exists');

            } else {

                properties.push(prop);

                deferred.resolve();
            }

            return deferred.promise;

        };

        var parseType = function(type) {

            var parse = function(t) {
                if (t && t.type) {
                    return t.type;
                } else {
                    return t;
                }
            };

            if (_.isString(type)) {
                return type;
            } else if (_.isArray(type)) {
                return parse(type[1]);
            } else {
                return parse(type);
            }

        };

        var parseTypeObj = function(type) {

            return _.isArray(type) ? type[1] : type;

        };

        var parseEnum = function(t) {

            var type = parseTypeObj(t);

            if (type.type === 'enum') {

                return {name: type.name, symbols: type.symbols || ['']};

            } else {
                return {name: null, symbols: null};
            }

        };

        /**
         * Transform property's section structure according to its type
         *
         * @param orig
         * @param dest
         * @param exclude
         */
        var transformPropertySection = function(orig, dest, exclude) {

            var ignore = ['@id', 'name', 'depth', 'schema'];

            _.each(dest, function(fields, key) {

                if (!_.contains(ignore, key)) {

                    if (!_.contains(_.keys(orig), key) && key !== exclude) {
                        delete dest[key];
                    }

                    _.each(orig, function(value, field) {
                        if (_.isUndefined(dest[field])) {
                            dest[field] = value;
                        }
                    });
                }

            });

        };

        /**
         * Transform property structure according to its type
         *
         * @param property
         * @param mode
         * @param type
         */
        var transformProperty = function(property, mode, type) {

            var map = getMap()[mode];
            type = parseType(type);

            transformPropertySection(map[type].root, property, 'adapter');
            transformPropertySection(map[type].adapter, property.adapter);

        };

        var generateCommand = function() {

        };

        var isRequired = function(type) {

            return _.isArray(type) && type.length > 1 && type[0] === 'null';

        };

        var formatProperty = function(inner, property) {

            var type;
            var p = angular.copy(property);

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

            if (inner.key === '@id' && inner.type === 'array') {

                type = 'array';
                p.items = inner.items;

                stripParams(p, p.items.type);


            } else if (inner.key === 'name' && inner.type === 'array') {

                type = {
                    type: 'array',
                    items: inner.items
                };

                stripParams(p, type.items.type);

            } else if (inner.type === 'enum') {

                type = {
                    type: 'enum',
                    name: inner.enumName,
                    symbols: inner.symbols
                };

            } else {
                type = inner.type;
            }

            if (inner.required) {
                p.type = ['null', type];
            } else {
                p.type = type;
            }

            return p;

        };

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

        var getTplType = function(type) {

            var general = ['file', 'string', 'int', 'float', 'boolean'];

            if (_.contains(general, type)) {
                return 'general';
            } else {
                return type;
            }

        };

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

//        var formatItems = function(key, type, items) {
//
//            if (type === 'array') {
//
//                if (key === '@id') {
//                    return property.items;
//                } else {
//                    return property.type.items;
//                }
//            } else {
//                return null;
//            }
//
//        };

        return {
            checkVersion: checkVersion,
            fetchLocalToolAndJob: fetchLocalToolAndJob,
            setTool: setTool,
            setJob: setJob,
            getTool: getTool,
            getJob: getJob,
            flush: flush,
            getTransformSchema: getTransformSchema,
            addProperty: addProperty,
            transformProperty: transformProperty,
            generateCommand: generateCommand,
            isRequired: isRequired,
            parseType: parseType,
            parseEnum: parseEnum,
            formatProperty: formatProperty,
            copyPropertyParams: copyPropertyParams,
            getTplType: getTplType,
            getItemsRef: getItemsRef
        };

    }]);
