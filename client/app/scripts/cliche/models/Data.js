/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .factory('Data', ['$localForage', '$http', '$q', '$injector', function ($localForage, $http, $q, $injector) {

        var self = {};

        /**
         * Version of the storage
         *
         * @type {number}
         */
        self.version = 14;

        /**
         * Tool json object
         *
         * @type {object}
         */
        self.tool = {};

        /**
         * Job json object
         *
         * @type {object}
         */
        self.job = null;

        /**
         * Command generated from input and adapter values
         * @type {string}
         */
        self.command = '';

        /**
         * Fetch tool object from storage
         *
         * @returns {*}
         */
        self.fetchTool = function() {

            var deferred = $q.defer();

            $localForage.getItem('tool').then(function(tool) {
                if (_.isNull(tool) || _.isEmpty(tool)) {
                    $http({method: 'GET', url: 'data/tool.json'})
                        .success(function(data) {
                            self.tool = data.tool;
                            deferred.resolve(data.tool);
                            $localForage.setItem('tool', data.tool);
                        })
                        .error(function() {
                            deferred.reject('JSON file could not be fetched');
                        });
                } else {
                    self.tool = tool;
                    deferred.resolve(tool);
                }
            });

            return deferred.promise;

        };

        /**
         * Fetch job object from storage
         *
         * @returns {*}
         */
        self.fetchJob = function() {

            var deferred = $q.defer();

            $localForage.getItem('job').then(function(job) {
                if (_.isNull(job) || _.isEmpty(job)) {
                    $http({method: 'GET', url: 'data/job.json'})
                        .success(function(data) {
                            self.job = data.job;
                            deferred.resolve(data.job);
                            $localForage.setItem('job', data.job);
                        })
                        .error(function() {
                            deferred.reject('JSON file could not be fetched');
                        });
                } else {
                    self.job = job;
                    deferred.resolve(job);
                }
            });

            return deferred.promise;

        };

        /**
         * Set tool object
         *
         * @param {Object} tool
         */
        self.setTool = function(tool) {

            self.tool = tool;

            $localForage.setItem('tool', tool);

        };

        /**
         * Set job object
         *
         * @param {Object} job
         */
        self.setJob = function(job) {

            job = job || $injector.get('rawJob');

            self.job = job;

            $localForage.setItem('job', job);

        };

        /**
         * Get map for the input
         *
         * @type {object}
         */
        self.getMap = function() {

            var map = {
                input: {
                    file: {
                        root: {
                            type: 'string',
                            required: false
                        },
                        adapter: {prefix: '', separator: '_', order: 0, transform: undefined, streamable: false}
                    },
                    string: {
                        root: {
                            type: 'string',
                            required: false,
                            enum: null
                        },
                        adapter: {prefix: '', separator: '_', order: 0, transform: undefined}
                    },
                    integer: {
                        root: {
                            type: 'string',
                            required: false
                        },
                        adapter: {prefix: '', separator: '_', order: 0, transform: undefined}
                    },
                    array: {
                        root: {
                            type: 'string',
                            required: false,
                            minItems: undefined,
                            maxItems: undefined,
                            items: {type: 'string'}
                        },
                        adapter: {prefix: '', separator: '_', order: 0, listTransform: undefined, listSeparator: ','}
                    },
                    boolean: {
                        root: {
                            type: 'string',
                            required: false
                        },
                        adapter: {prefix: '', separator: '_', order: 0, transform: undefined}
                    },
                    object: {
                        root: {
                            type: 'string',
                            required: false,
                            properties: {}
                        },
                        adapter: {prefix: '', separator: '_', order: 0}
                    }
                },
                output: {
                    file: {
                        root: {
                            type: 'string',
                            required: false
                        },
                        adapter: {streamable: false, glob: '', meta: {}, secondaryFiles: []}
                    },
                    directory: {
                        root: {
                            type: 'string',
                            required: false
                        },
                        adapter: {glob: '', meta: {}, secondaryFiles: []}
                    },
                    array: {
                        root: {
                            type: 'string',
                            required: false,
                            minItems: undefined,
                            maxItems: undefined,
                            items: {type: 'file'}
                        },
                        adapter: {listStreamable: false, meta: {}, secondaryFiles: []}
                    }
                }
            };

            return map;
        };

        /**
         * Save tool and job json
         *
         * @returns {*}
         */
        self.save = function() {

            var deferred = $q.defer();

            $q.all([
                $localForage.setItem('tool', self.tool),
                $localForage.setItem('job', self.job)
            ]).then(
                function() {
                    deferred.resolve();
                }, function() {
                    deferred.reject();
                });

            return deferred.promise;
        };

        /**
         * Add new property
         *
         * @param type
         * @param name
         * @param prop
         * @param property
         */
        self.addProperty = function(type, name, prop, properties) {

            var deferred = $q.defer();

            if (type === 'arg') {

                properties.push(prop);

                deferred.resolve();

            } else {
                if (!_.isUndefined(properties[name])) {

                    deferred.reject('Choose another key, the one already exists');

                } else {

                    properties[name] = prop;

                    deferred.resolve();

                }
            }

            return deferred.promise;

        };

        /**
         * Delete property from the object
         *
         * @param type
         * @param index
         * @param properties
         */
        self.deleteProperty = function(type, index, properties) {

            if (type === 'arg') {
                properties.splice(index, 1);
            } else {
                delete properties[index];
            }

        };

        /**
         * Apply the transformation function (this is just the mock)
         *
         * @param transform
         * @param value
         * @returns {*}
         */
        self.applyTransform = function(transform, value, self) {

            var deferred = $q.defer();
            var SandBox = $injector.get('SandBox');

            var expr = (transform && transform.expr) ? transform.expr.value : null;
            var selfInput = self ? {$self: value} : {};

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
         * Parse separator for the input value
         *
         * @param {string} prefix
         * @param {string} separator
         * @returns {string} output
         */
        self.parseSeparator = function(prefix, separator) {

            var output = '';

            if (_.isUndefined(separator) || separator === '_') {
                output = (prefix === '') ? '' : ' ';
            } else {
                output = (prefix === '') ? '' : separator;
            }

            return output;

        };

        /**
         * Parse prefix for the input value
         *
         * @param {string} prefix
         * @returns {string} output
         */
        self.parsePrefix = function(prefix) {

            var output = '';

            if (_.isUndefined(prefix)) {
                output = '';
            } else {
                output = prefix;
            }

            return output;

        };

        /**
         * Parse list separator for the input value
         *
         * @param listSeparator
         * @returns {string}
         */
        self.parseListSeparator = function(listSeparator) {

            var output = '';

            if (_.isUndefined(listSeparator) || listSeparator === '_') {
                output = ' ';
            } else {
                output = listSeparator;
            }

            return output;

        };

        /**
         * Parse input value of the array type
         *
         * @param {object} property
         * @param {object} input
         * @param {string} prefix
         * @param {string} separator
         * @param {string} listSeparator
         * @returns {string}
         */
        self.parseArrayInput = function(property, input, prefix, separator, listSeparator) {

            var joiner = ' ';
            var promises = [];

            if (property.items.type !== 'object') {
                joiner = listSeparator === 'repeat' ? (' ' + prefix + separator) : listSeparator;
            }

            _.each(input, function(val) {

                var deferred = $q.defer();

                if (property.items.type === 'object') {
                    self.parseObjectInput(property.items.properties, val)
                        .then(function (result) {
                            deferred.resolve(result);
                        });
                } else {
                    self.applyTransform(property.adapter.listTransform, (_.isObject(val) ? val.path : val), true)
                        .then(function (result) {
                            deferred.resolve(result);
                        }, function (error) {
                            deferred.reject(error);
                        });
                }

                promises.push(deferred.promise);
            });

            return $q.all(promises)
                    .then(function (result) {
                        return result.join(joiner);
                    }, function (error) {
                        return '"' + error.message + '"';
                    });

        };

        /**
         * Prepare properties for the command line generating
         *
         * @param {object} properties
         * @param {object} inputs
         * @returns {Promise} props
         */
        self.prepareProperties = function(properties, inputs) {

            var promises = [];

            /* go through properties */
            _.each(properties, function(property, key) {
                if (!_.isUndefined(inputs[key])) {

                    var deferred = $q.defer();
                    var prefix = self.parsePrefix(property.adapter.prefix);
                    var separator = self.parseSeparator(prefix, property.adapter.separator);
                    var listSeparator = self.parseListSeparator(property.adapter.listSeparator);

                    var prop = _.merge({key: key, order: property.adapter.order, value: '', prefix: prefix, separator: separator}, property);

                    switch (property.type) {
                    case 'array':
                        /* if input is ARRAY */
                        self.parseArrayInput(property, inputs[key], prefix, separator, listSeparator)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            });
                        break;
                    case 'file':
                        /* if input is FILE */
                        self.applyTransform(property.adapter.transform, inputs[key].path, true)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            });
                        break;
                    case 'object':
                        /* if input is OBJECT */
                        self.parseObjectInput(property.properties, inputs[key])
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            });
                        break;
                    case 'boolean':
                        /* if input is BOOLEAN */
                        prop.value = '';
                        deferred.resolve(prop);
                        if (inputs[key]) {
                            promises.push(deferred.promise);
                        }
                        break;
                    default:
                        /* if input is anything else (STRING, INTEGER) */
                        self.applyTransform(property.adapter.transform, inputs[key], true)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            });

                        break;
                    }

                    if (prop.type !== 'boolean') {
                        promises.push(deferred.promise);
                    }

                }
            });

            return $q.all(promises);

        };

        /**
         * Recursive method for parsing object input values
         *
         * @param {object} properties
         * @param {object} inputs
         * @returns {string} output
         */
        self.parseObjectInput = function(properties, inputs) {

            var command = [];

            return self.prepareProperties(properties, inputs)
                .then(function (props) {

                    props = _.sortBy(props, 'order');

                    /* generate command */
                    _.each(props, function(prop) {
                        command.push(prop.prefix + prop.separator + prop.value);
                    });

                    var output = command.join(' ');

                    return output;

                });

        };

        /**
         * Generate the command
         *
         * @return {string} output
         */
        self.generateCommand = function() {

            return self.prepareProperties(self.tool.inputs.properties, self.job.inputs)
                /* go through arguments and concat then with inputs */
                .then(function (props) {

                    var argsPromises = [];
                    _.each(self.tool.adapter.args, function(arg, key) {

                        var deferred = $q.defer();
                        var prefix = self.parsePrefix(arg.prefix);
                        var argObj = angular.copy(arg);
                        delete argObj.value;

                        var prop = _.merge({key: 'arg' + key, order: arg.order, prefix: prefix, value: ''}, argObj);

                        self.applyTransform(arg.value, arg.value)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            });

                        argsPromises.push(deferred.promise);
                    });

                    return $q.all(argsPromises).then(function (args) {
                            return _.sortBy(props.concat(args), 'order');
                        });

                })
                /* generate command from arguments and inputs and apply transforms on baseCmd */
                .then(function (joined) {

                    var command = [];
                    var baseCmdPromises = [];

                    _.each(joined, function(arg) {

                        var separator = self.parseSeparator(arg.prefix, arg.separator);
                        var value = _.isUndefined(arg.value) ? '' : arg.value;

                        if (!(arg.type && arg.type !== 'boolean' && (arg.value === '' || _.isNull(arg.value) || _.isUndefined(arg.value)))) {
                            var cmd = arg.prefix + separator + value;

                            if (!_.isEmpty(cmd)) {
                                command.push(cmd);
                            }
                        }

                    });

                    _.each(self.tool.adapter.baseCmd, function (baseCmd) {

                        var deferred = $q.defer();

                        self.applyTransform(baseCmd, baseCmd)
                            .then(function (result) {
                                deferred.resolve(result);
                            });

                        baseCmdPromises.push(deferred.promise);
                    });

                    return $q.all(baseCmdPromises).then(function (cmds) {
                            return {command: command, baseCmd: cmds.join(' ')};
                        });

                })
                /* apply transforms on stdout */
                .then(function (res) {
                    return self.applyTransform(self.tool.adapter.stdout, self.tool.adapter.stdout)
                            .then(function (result) {
                                return {command: res.command, baseCmd: res.baseCmd, stdout: result};
                            });
                })
                /* generate final command */
                .then(function (result) {

                    self.command = result.baseCmd + ' ' + result.command.join(' ') + ' > ' + result.stdout;

                    return self.command;

                });
        };

        /**
         * Check if old version of structure and if yes erase the store
         *
         * @returns {*}
         */
        self.checkStructure = function() {

            var deferred = $q.defer();

            $localForage.getItem('version')
                .then(function(version) {

                    if (version === self.version) {
                        deferred.resolve();
                        return false;
                    }

                    $q.all([
                            $localForage.setItem('version', self.version),
                            $localForage.setItem('tool', {}),
                            $localForage.setItem('job', {}),
                        ]).then(function() {
                            deferred.resolve();
                        });

                });

            return deferred.promise;

        };

        /**
         * Cleanup the local db and prepare fresh cliche vars
         *
         * @returns {Object}
         */
        self.flush = function() {

            var tool = $injector.get('rawTool');
            var job = $injector.get('rawJob');

            self.tool = tool;
            self.job = job;
            self.command = '';

            return $q.all([
                    $localForage.setItem('tool', tool),
                    $localForage.setItem('job', job),
                ]).then(function() {
                    return {
                        tool: tool,
                        job: job
                    };
                });

        };

        return self;


    }]);