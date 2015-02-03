/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .factory('Data', ['$localForage', '$http', '$q', '$injector', 'rawTool', 'rawJob', function ($localForage, $http, $q, $injector, rawTool, rawJob) {

        var self = {};

        /**
         * Version of the storage
         *
         * @type {number}
         */
        self.version = 22;

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
         *
         * @type {string}
         */
        self.command = '';

        /**
         * Fetch tool and job from local db if exist
         *
         * @returns {*}
         */
        self.fetchLocalToolAndJob = function () {

            var deferred = $q.defer();

            $q.all([
                    $localForage.getItem('tool'),
                    $localForage.getItem('job')
                ]).then(function (result) {

                    self.tool = result[0];
                    self.job = result[1];

                    deferred.resolve({tool: self.tool, job: self.job});
                });

            return deferred.promise;
        };

        /**
         * Set tool object
         *
         * @param {Object} tool
         */
        self.setTool = function(tool) {

            self.tool = angular.copy(tool);

            $localForage.setItem('tool', tool);

        };

        /**
         * Set job object
         *
         * @param {Object} job
         */
        self.setJob = function(job) {

            job = job || rawJob;

            self.job = angular.copy(job);

            $localForage.setItem('job', job);

        };

        /**
         * Get scheme for the input and output
         *
         * @type {object}
         */
        self.getMap = function() {

            var map = {
                input: {
                    file: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', order: 0, value: null, streamable: false}
                    },
                    string: {
                        root: {
                            type: 'string',
                            enum: null
                        },
                        adapter: {prefix: '', separator: ' ', order: 0, value: null}
                    },
                    integer: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', order: 0, value: null}
                    },
                    number: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', order: 0, value: null}
                    },
                    array: {
                        root: {
                            type: 'string',
                            minItems: null,
                            maxItems: null,
                            items: {type: 'string'}
                        },
                        adapter: {prefix: '', separator: ' ', order: 0, value: null, itemSeparator: ','}
                    },
                    boolean: {
                        root: {
                            type: 'string'
                        },
                        adapter: {prefix: '', separator: ' ', order: 0, value: null}
                    },
                    object: {
                        root: {
                            type: 'string',
                            properties: {}
                        },
                        adapter: {prefix: '', separator: ' ', order: 0}
                    }
                },
                output: {
                    file: {
                        root: {
                            type: 'string'
                        },
                        adapter: {streamable: false, glob: '', metadata: {}, secondaryFiles: []}
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
                            minItems: null,
                            maxItems: null,
                            items: {type: 'file'}
                        },
                        adapter: {glob: '', streamable: false, metadata: {}, secondaryFiles: []}
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

            return $q.all([
                $localForage.setItem('tool', self.tool),
                $localForage.setItem('job', self.job)
            ]);
        };

        /**
         * Add new property
         *
         * @param type
         * @param name
         * @param prop
         * @param properties
         */
        self.addProperty = function(type, name, prop, properties) {

            var deferred = $q.defer();

            if (type === 'arg') {

                properties.push(prop);

                deferred.resolve();

            } else {
                if (properties && !_.isUndefined(properties[name])) {

                    deferred.reject('Choose another name, the one already exists');

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

            var expr = (transform && transform.$expr) ? transform.$expr : null;
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
        self.parseItemSeparator = function(itemSeparator) {

            var output = '';

            if (_.isUndefined(itemSeparator) || itemSeparator === ' ') {
                output = ' ';
            } else {
                output = itemSeparator;
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
         * @param {string} itemSeparator
         * @returns {string}
         */
        self.parseArrayInput = function(property, input, prefix, separator, itemSeparator) {

            var joiner = ' ';
            var promises = [];

            if (property.items && property.items.type !== 'object') {
                joiner = _.isNull(itemSeparator) ? (' ' + prefix + separator) : itemSeparator;
            }

            var evaluate = function (val) {

                var deferred = $q.defer();

                if (property.items && property.items.type === 'object') {
                    self.parseObjectInput(property.items.properties, val)
                        .then(function (result) {
                            deferred.resolve(result);
                        }, function (error) {
                            deferred.reject(error);
                        });
                } else {
                    self.applyTransform(property.adapter.value, (_.isObject(val) ? val.path : val), true)
                        .then(function (result) {
                            deferred.resolve(result);
                        }, function (error) {
                            deferred.reject(error);
                        });
                }

                return deferred.promise;

            };

            _.each(input, function(val) {
                promises.push(evaluate(val));
            });

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
        self.prepareProperties = function(properties, inputs) {

            var promises = [];

            /* go through properties */
            _.each(properties, function(property, key) {

                if (!_.isUndefined(inputs[key]) && property.adapter) {

                    var deferred = $q.defer();
                    var prefix = property.adapter.prefix || '';
                    var separator = self.parseSeparator(prefix, property.adapter.separator);
                    var itemSeparator = self.parseItemSeparator(property.adapter.itemSeparator);

                    var prop = _.merge({key: key, order: property.adapter.order, value: '', prefix: prefix, separator: separator}, property);

                    switch (property.type) {
                    case 'array':
                        /* if input is ARRAY */
                        self.parseArrayInput(property, inputs[key], prefix, separator, itemSeparator)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
                            });
                        break;
                    case 'file':
                        /* if input is FILE */
                        self.applyTransform(property.adapter.value, inputs[key].path, true)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
                            });
                        break;
                    case 'object':
                        /* if input is OBJECT */
                        self.parseObjectInput(property.properties, inputs[key])
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
                            });
                        break;
                    case 'boolean':
                        /* if input is BOOLEAN */
                        if (property.adapter.value) {
                            //TODO: this is hack, if bool type has expression defined then it works in the same way as (for example) string input type
                            prop.type = 'string';
                            self.applyTransform(property.adapter.value, inputs[key], true)
                                .then(function (result) {
                                    prop.value = result;
                                    deferred.resolve(prop);
                                }, function (error) {
                                    deferred.reject(error);
                                });
                        } else {
                            prop.value = '';
                            deferred.resolve(prop);
                            if (inputs[key]) {
                                promises.push(deferred.promise);
                            }
                        }
                        break;
                    default:
                        /* if input is anything else (STRING, INTEGER) */
                        self.applyTransform(property.adapter.value, inputs[key], true)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
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

                }, function (error) { return $q.reject(error); });

        };

        /**
         * Generate the command
         *
         * @return {string} output
         */
        self.generateCommand = function() {

            var isScript = !self.tool.adapter;

            if (isScript) {
                return false;
            }

            return self.prepareProperties(self.tool.inputs.properties, self.job.inputs)
                /* go through arguments and concat then with inputs */
                .then(function (props) {

                    var argsPromises = [];

                    _.each(self.tool.adapter.args, function(arg, key) {

                        var deferred = $q.defer();
                        var prefix = arg.prefix || '';
                        var argObj = angular.copy(arg);
                        delete argObj.value;

                        var prop = _.merge({key: 'arg' + key, order: arg.order, prefix: prefix, value: ''}, argObj);

                        self.applyTransform(arg.value, arg.value)
                            .then(function (result) {
                                prop.value = result;
                                deferred.resolve(prop);
                            }, function (error) {
                                deferred.reject(error);
                            });

                        argsPromises.push(deferred.promise);
                    });

                    return $q.all(argsPromises)
                            .then(function (args) {
                                return _.sortBy(props.concat(args), 'order');
                            }, function (error) { return $q.reject(error); });

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
                            self.applyTransform(self.tool.adapter.stdin, self.tool.adapter.stdin),
                            self.applyTransform(self.tool.adapter.stdout, self.tool.adapter.stdout)
                        ]).then(function(result) {
                            return {command: res.command, baseCmd: res.baseCmd, stdin: result[0], stdout: result[1]};
                        }, function (error) { return $q.reject(error); });
                })
                /* generate final command */
                .then(function (result) {

                    self.command = result.baseCmd + ' ' + result.command.join(' ');

                    if (result.stdin) {
                        self.command += ' < ' + result.stdin;
                    }

                    if (result.stdout) {
                        self.command += ' > ' + result.stdout;
                    }

                    return self.command;

                })
                .catch(function (error) { return $q.reject(error); });
        };

        /**
         * Check if old version of structure and if yes erase the store
         *
         * @returns {*}
         */
        self.checkStructure = function() {

            return $localForage.getItem('version')
                .then(function(version) {

                    if (version === self.version) {
                        return false;
                    } else {
                        return $q.all([
                            $localForage.setItem('version', self.version),
                            $localForage.setItem('tool', rawTool),
                            $localForage.setItem('job', rawJob)
                        ]);
                    }
                });

        };

        /**
         * Cleanup the local db and prepare fresh cliche vars
         *
         * @returns {Object}
         */
        self.flush = function(name) {

            var tool = angular.copy(rawTool);
            var job = angular.copy(rawJob);
            var isScript = !self.tool.adapter;

            self.tool = tool;
            self.tool.name = name;
            self.job = job;
            self.command = '';

            if (isScript) {
                delete self.tool.adapter;
            }

            return $q.all([$localForage.setItem('tool', tool), $localForage.setItem('job', job)]);

        };

        /**
         * Transform tool json into appropriate structure
         *
         * @param isScript
         */
        self.transformToolJson = function(isScript) {

            var transformed = angular.copy(self.tool);

            if (isScript) {
                transformed.script = '';
                delete transformed.adapter;
                delete transformed.requirements;
            } else {
                delete transformed.script;
                transformed.adapter = angular.copy(rawTool.adapter);
                transformed.requirements = angular.copy(rawTool.requirements);
            }

            self.setTool(transformed);

        };

        /**
         * Transform property's section structure according to its type
         *
         * @param orig
         * @param dest
         * @param exclude
         */
        self.transformPropertySection = function(orig, dest, exclude) {

            _.each(dest, function(fields, key) {

                if (!_.contains(_.keys(orig), key) && key !== exclude) {
                    delete dest[key];
                }

                _.each(orig, function(value, field) {
                    if (_.isUndefined(dest[field])) {
                        dest[field] = value;
                    }
                });

            });

        };

        /**
         * Transform property structure according to its type
         *
         * @param property
         * @param mode
         * @param type
         */
        self.transformProperty = function(property, mode, type) {

            var map = self.getMap()[mode];

            self.transformPropertySection(map[type].root, property, 'adapter');
            self.transformPropertySection(map[type].adapter, property.adapter);

        };

        return self;


    }]);