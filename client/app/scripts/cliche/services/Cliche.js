/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:33 PM
 */
'use strict';
angular.module('registryApp.cliche')
    .factory('Cliche', ['$q', '$localForage', '$injector', 'rawTool', 'rawJob', 'rawTransform', function($q, $localForage, $injector, rawTool, rawJob, rawTransform) {

        /**
         * Version of the storage
         *
         * @type {number}
         */
        var version = 1;

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
        var consoleCMD = '';

        /**
         * Command generator callback
         *
         * @type {*|Function}
         */
        var consoleCMDCallback;

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

                transformed['@type'] = 'Script';
                transformed.transform = getTransformSchema();
                delete transformed.cliAdapter;
                delete transformed.requirements;

            } else {

                transformed['@type'] = 'CommandLine';

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

            consoleCMD = '';

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

            var exists,
                idName,
                ids,
                compare,
                deferred = $q.defer();

            if (prop['@id']) {

                ids = [
                    [toolJSON['@id']],
                    _.pluck(toolJSON.inputs, '@id'),
                    _.pluck(toolJSON.outputs, '@id')
                ];

                ids = _.reduce(ids, function(fl, a) { return fl.concat(a); }, []);


                idName = 'id';
                compare = prop['@id'];
                exists = _.contains(ids, compare);
            } else {
                idName = 'name';
                compare = prop.name;
                exists = _.find(properties, {'name': compare});
            }

            if (exists) {
                deferred.reject('Choose another ' + idName + ', "' + compare + '" already exists');
            } else {
                deferred.resolve();
            }

            return deferred.promise;

        };

        /**
         * Check if enum name already exists in entire tool object
         *
         * @param {string} mode
         * @param {object} nameObj
         * @returns {*}
         */
        var checkIfEnumNameExists = function(mode, nameObj) {

            /**
             * Recursive method which compares enum names
             *
             * @param {string} name
             * @param {array} inputs
             * @param {boolean} isFirstLevel
             * @returns {boolean}
             */
            var checkInner = function(name, inputs, isFirstLevel) {

                var exists = false;

                _.each(inputs, function(input) {

                    input = isFirstLevel ? input.schema : input;

                    var type = parseType(input.type);

                    if (type === 'enum') {
                        var enumObj = parseEnum(input.type);
                        if (enumObj.name === name) {
                            exists = true;
                            return false;
                        }
                    } else if (type === 'array' && input.items && input.items.type === 'record') {
                        exists = checkInner(name, input.items.fields);
                        if (exists) {
                            return false;
                        }
                    }
                });

                return exists;

            };

            if (mode === 'edit') {

                if (nameObj.name !== nameObj.newName) {
                    return checkInner(nameObj.newName, toolJSON.inputs, true);
                } else {
                    return false;
                }

            } else if (mode === 'add') {
                return checkInner(nameObj.newName, toolJSON.inputs, true);
            }

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
         * Delete property (input or output) from the object
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
         * @param {*} schema
         * @returns {string} type
         */
        var parseType = function(schema) {

            if (_.isString(schema)) {
                return schema;

            } else if ( _.isArray(schema)) {
                var tmp = schema[1] || schema[0];
                return _.isObject(tmp) ? tmp.type : tmp;

            } else if (_.isObject(schema)) {
                return schema.type;
            }
        };

        /**
         * Extract type original object
         *
         * @param {*} type
         * @returns {*}
         */
        var parseTypeObj = function(type) {

            return _.isArray(type) ? type[1] || type[0] : type;

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
         * @param {Object} property
         * @returns {*}
         */
        var parseName = function(property) {

            if (_.isUndefined(property)) {
                return '';
            }

            if (property['@id']) {
                return property['@id'] ? property['@id'].slice(1) : '';
            } else {
                return property.name;
            }

        };

        /**
         * Parse separator for the input value
         *
         * @param {string} prefix
         * @param {string} separator
         * @returns {string} output
         */
        var parseSeparator = function(prefix, separator) {

            var output = '';

            if (_.isUndefined(separator) || separator === ' ') {
                output = (prefix === '') ? '' : ' ';
            } else {
                output = (prefix === '') ? '' : separator;
            }

            return output;

        };

        /**
         * Parse item separator for the input value
         *
         * @param itemSeparator
         * @returns {string}
         */
        var parseItemSeparator = function(itemSeparator) {

            var output = '';

            if (_.isUndefined(itemSeparator) || itemSeparator === ' ') {
                output = ' ';
            } else {
                output = itemSeparator;
            }

            return output;

        };

        /**
         * Recursive method for parsing object input values
         *
         * @param {object} properties
         * @param {object} inputs
         * @returns {string} output
         */
        var parseObjectInput = function(properties, inputs) {

            var command = [];

            return prepareProperties(properties, inputs)
                .then(function (props) {

                    props = _.sortBy(props, 'position');

                    /* generate command */
                    _.each(props, function(prop) {
                        command.push(prop.prefix + prop.separator + prop.val);
                    });

                    return command.join(' ');

                }, function (error) { return $q.reject(error); });

        };

        /**
         * Apply the transformation function (this is just the mock)
         *
         * @param transform
         * @param value
         * @returns {*}
         */
        var applyTransform = function(transform, value, self) {

            var deferred = $q.defer(),
                SandBox = $injector.get('SandBox'),
                expr = (transform && transform.value) ? transform.value : null,
                selfInput = self ? {$self: value} : {};

            if (expr) {

                SandBox.evaluate(expr, selfInput)
                    .then(function (result) {
                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });

            } else {
                deferred.resolve(value);
            }

            return deferred.promise;
        };

        /**
         * Parse input value of the array type
         *
         * @param {object} property
         * @param {object} input
         * @param {string} prefix
         * @param {string} separator
         * @param {string} itemSeparator
         * @returns {string}
         */
        var parseArrayInput = function(property, input, prefix, separator, itemSeparator) {

            var promises = [],
                joiner = ' ',
                schema = getSchema('input', property, 'tool', false),
                type = parseType(schema),
                items = getItemsRef(type, schema);

            if (items && items.type !== 'record') {
                joiner = _.isNull(itemSeparator) ? (' ' + prefix + separator) : itemSeparator;
            }

            var evaluate = function (val) {

                var deferred = $q.defer();

                if (items && items.type === 'record') {
                    parseObjectInput(items.fields, val)
                        .then(function (result) {
                            deferred.resolve(result);
                        }, function (error) {
                            deferred.reject(error);
                        });
                } else {
                    applyTransform(property.adapter.argValue, (_.isObject(val) ? val.path : val), true)
                        .then(function (result) {
                            deferred.resolve(result);
                        }, function (error) {
                            deferred.reject(error);
                        });
                }

                return deferred.promise;

            };

            if(_.isArray(input)) {
                _.each(input, function(val) {
                    promises.push(evaluate(val));
                });
            } else if (_.isString(input)) {
                promises.push(input);
            }


            return $q.all(promises)
                .then(function (result) {
                    return result.join(joiner);
                }, function (error) {
                    return $q.reject(error);
                });

        };

        /**
         * Prepare properties for the command line generating
         *
         * @param {object} properties
         * @param {object} inputs
         * @returns {Promise} props
         */
        var prepareProperties = function(properties, inputs) {

            var promises = [],
                keys = _.keys(inputs),
                defined = _.filter(properties, function(property) {

                    var key = parseName(property);

                    return _.contains(keys, key) && property.adapter;
                });

            /* go through properties */
            _.each(defined, function(property) {

                var deferred = $q.defer(),
                    key = parseName(property),
                    schema = getSchema('input', property, 'tool'),
                    type = parseType(schema),
                    items = getItemsRef(type, schema),
                    prefix = property.adapter.prefix || '',
                    separator = parseSeparator(prefix, property.adapter.separator),
                    itemSeparator = parseItemSeparator(property.adapter.itemSeparator),

                    prop = _.extend({
                        key: key,
                        type: type,
                        val: '',
                        position: property.adapter.position || 0,
                        prefix: prefix,
                        separator: separator
                    }, property.adapter);

                switch (type) {
                case 'array':
                    /* if input is ARRAY */
                    parseArrayInput(property, inputs[key], prefix, separator, itemSeparator)
                        .then(function (result) {
                            prop.val = result;
                            deferred.resolve(prop);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    break;
                case 'file':
                    /* if input is FILE */
                    applyTransform(property.adapter.argValue, inputs[key].path, true)
                        .then(function (result) {
                            prop.val = result;
                            deferred.resolve(prop);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    break;
                case 'record':
                    /* if input is RECORD - not in use at this moment, because input type can not be record for now */
                    parseObjectInput(items.fields, inputs[key])
                        .then(function (result) {
                            prop.val = result;
                            deferred.resolve(prop);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    break;
                case 'boolean':
                    /* if input is BOOLEAN */
                    if (property.adapter.argValue) {
                        //TODO: this is hack, if bool type has expression defined then it works in the same way as (for example) string input type
                        prop.type = 'string';
                        applyTransform(property.adapter.argValue, inputs[key], true)
                            .then(function (result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
                            });
                    } else {
                        prop.val = '';
                        deferred.resolve(prop);
                        if (inputs[key]) {
                            promises.push(deferred.promise);
                        }
                    }
                    break;
                default:
                    /* if input is anything else (STRING, ENUM, INT, FLOAT) */
                    applyTransform(property.adapter.argValue, inputs[key], true)
                        .then(function (result) {
                            prop.val = result;
                            deferred.resolve(prop);
                        }, function (error) {
                            deferred.reject(error);
                        });

                    break;
                }

                if (prop.type !== 'boolean') {
                    promises.push(deferred.promise);
                }

            });

            return $q.all(promises);

        };

        /**
         * Generate the command
         *
         * @return {string} output
         */
        var generateCommand = function() {

            if (!toolJSON.cliAdapter) { return false; }

            return prepareProperties(toolJSON.inputs, jobJSON.inputs)
                /* go through arguments and concat then with inputs */
                .then(function (props) {

                    var argsPromises = [];

                    _.each(toolJSON.cliAdapter.argAdapters, function(arg, key) {

                        var deferred = $q.defer(),
                            prefix = arg.prefix || '',
                            prop = _.merge({key: 'arg' + key, position: arg.position, prefix: prefix, val: ''}, arg);

                        applyTransform(arg.argValue, arg.argValue)
                            .then(function (result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
                            });

                        argsPromises.push(deferred.promise);
                    });

                    return $q.all(argsPromises)
                        .then(function (args) {
                            return _.sortBy(props.concat(args), 'position');
                        }, function (error) { return $q.reject(error); });

                })
                /* generate command from arguments and inputs and apply transforms on baseCmd */
                .then(function (joined) {

                    var command = [],
                        baseCmdPromises = [];

                    _.each(joined, function(arg) {

                        var separator = parseSeparator(arg.prefix, arg.separator),
                            value = _.isUndefined(arg.val) ? '' : arg.val,
                            cmd;

                        if (!(arg.type && arg.type !== 'boolean' && (arg.val === '' || _.isNull(arg.val) || _.isUndefined(arg.val)))) {
                            cmd = arg.prefix + separator + value;

                            if (!_.isEmpty(cmd)) {
                                command.push(cmd);
                            }
                        }

                    });

                    _.each(toolJSON.cliAdapter.baseCmd, function (baseCmd) {

                        var deferred = $q.defer();

                        applyTransform(baseCmd, baseCmd)
                            .then(function (result) {
                                deferred.resolve(result);
                            }, function (error) {
                                deferred.reject(error);
                            });

                        baseCmdPromises.push(deferred.promise);
                    });

                    return $q.all(baseCmdPromises)
                        .then(function (cmds) {
                            return {command: command, baseCmd: cmds.join(' ')};
                        }, function (error) { return $q.reject(error); });

                })
                /* apply transforms on stdin/stdout */
                .then(function (res) {
                    return $q.all([
                            applyTransform(toolJSON.cliAdapter.stdin, toolJSON.cliAdapter.stdin),
                            applyTransform(toolJSON.cliAdapter.stdout, toolJSON.cliAdapter.stdout)
                        ]).then(function(result) {
                            return {command: res.command, baseCmd: res.baseCmd, stdin: result[0], stdout: result[1]};
                        }, function (error) { return $q.reject(error); });
                })
                /* generate final command */
                .then(function (result) {

                    consoleCMD = result.baseCmd + ' ' + result.command.join(' ');

                    if (result.stdin) {
                        consoleCMD += ' < ' + result.stdin;
                    }

                    if (result.stdout) {
                        consoleCMD += ' > ' + result.stdout;
                    }

                    if (_.isFunction(consoleCMDCallback)) {
                        consoleCMDCallback(consoleCMD);
                    }

                    return consoleCMD;

                })
                .catch(function (error) { return $q.reject(error); });

        };

        /**
         * Get currently generated command
         *
         * @returns {string}
         */
        var getCommand = function() {

            return consoleCMD;

        };

        /**
         * Subscribe on command generating
         *
         * @param f
         */
        var subscribe = function(f) {

            consoleCMDCallback = f;

        };

        /**
         * Check if property is required
         *
         * @param schema {array}
         * @returns {Boolean}
         */
        var isRequired = function(schema) {

            return !(schema.length > 1 && schema[0] === 'null');

        };

        /**
         * Format property according to avro schema
         *
         * @param {object} inner
         * @param {object} property
         * @param {string} propertyType - 'input' || 'output'
         * @returns {object}
         */
        var formatProperty = function(inner, property, propertyType) {

            var type,
                formatted = {},
                tmp = angular.copy(property);

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

            /* if any level and array */
            if (inner.type === 'array') {

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

            /* check if adapter has empty fields and remove them */
            /* and remove remove adapter property if no adapter is set */
            if (tmp.adapter) {
                _(tmp.adapter).keys().forEach(function (key) {

                    // _.isEmpty returns true for number values, which we don't want
                    // if there is a number value, then the prop is not empty
                    if (_.isEmpty(tmp.adapter[key]) && !_.isNumber(tmp.adapter[key])) {
                        delete tmp.adapter[key];
                    }
                });

                if (_.isEmpty(tmp.adapter)) {
                    delete tmp.adapter;
                }
            }

            /* schema for the first level */
            if (inner.key === '@id') {
                /* format structure for required property */
                tmp.schema = inner.required ? [type] : ['null', type];
                formatted = tmp;
                formatted['@id'] = '#' + inner.name;

                //@todo: actually calculate depth instead of hardcoding it
                formatted.depth = inner.type === 'array' ? 1 : 0;

            /*
            *  schema for every other level
            *  under the key "type"
            */
            } else {
                /* format structure for required property */
                tmp.type = inner.required ? [type] : ['null', type];
                /* remove schema which was automatically appended to property */
                delete tmp.schema;
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
         * @param {string} type
         * @param {Array} schema
         * @returns {*}
         */
        var getItemsRef = function(type, schema) {

            if (type === 'array') {
                var arr = schema[1] || schema[0];
                return arr.items;
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
                return (toolType === 'tool') ? ['null', defaultTypes[type]] : ['null', defaultTypes[type]];
            }

            if (_.isUndefined(property.schema) && _.isUndefined(property.type)) {
                /*
                in case of second level inputs where structure is
                {
                    type: {*},
                    name: {string}
                    adapters: {object}
                }
                 */
                return ref ? property : angular.copy(property);
            } else {
                return ref ? (property.schema || property.type) : (angular.copy(property.schema || property.type));
            }
        };

        var getAdapter = function (property, ref) {
            if (_.isEmpty(property)) {
                return {};
            }

            return ref ? property.adapter : angular.copy(property.adapter);
        };

        /**
         * Save tool locally
         *
         * @param mode
         * @returns {*}
         */
        var save = function(mode) {

            if (mode === 'new') {
                return $q.all([
                    $localForage.setItem('tool', toolJSON),
                    $localForage.setItem('job', jobJSON)
                ]);
            } else {
                var d = $q.defer();
                d.resolve();
                return d.promise;
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
            generateCommand: generateCommand,
            getCommand: getCommand,
            isRequired: isRequired,
            parseType: parseType,
            parseTypeObj: parseTypeObj,
            parseEnum: parseEnum,
            parseName: parseName,
            formatProperty: formatProperty,
            copyPropertyParams: copyPropertyParams,
            getTplType: getTplType,
            getItemsRef: getItemsRef,
            getTypes: getTypes,
            getSchema: getSchema,
            getAdapter: getAdapter,
            checkIfEnumNameExists: checkIfEnumNameExists,
            manageProperty: manageProperty,
            deleteProperty: deleteProperty,
            manageArg: manageArg,
            deleteArg: deleteArg,
            save: save,
            subscribe: subscribe
        };

    }]);
