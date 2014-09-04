'use strict';

angular.module('clicheApp')
    .factory('Data', ['$localForage', '$http', '$q', function ($localForage, $http, $q) {

        var self = {};

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
         * Get map for the input
         *
         * @type {object}
         */
        self.getMap = function() {

            var map = {
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
                    adapter: {prefix: '', separator: '_', order: 0, transform: undefined, listSeparator: ','}
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
                    adapter: {prefix: '', separator: '_', order: 0, transform: undefined}
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
        self.applyTransform = function(transform, value) {

            var output;

            switch(transform) {
            case 'transforms/strip_ext':
                var tmp = value ? value.split('.') : [];
                if (tmp[0]) { output = tmp[0]; }
                break;
            case 'transforms/m-suffix':
                output = value + 'm';
                break;
            default:
                output = value;
            }

            return output;
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
            var array = [];

            if (property.items.type !== 'object') {
                joiner = listSeparator === 'repeat' ? (' ' + prefix + separator) : listSeparator;
            }

            _.each(input, function(val) {
                var value = '';

                if (property.items.type === 'object') {
                    value = self.parseObjectInput(property.items.properties, val);
                } else {
                    value = self.applyTransform(property.adapter.listTransform, (_.isObject(val) ? val.path : val));
                }

                array.push(value);
            });

            return array.join(joiner);

        };

        /**
         * Prepare properties for the command line generating
         *
         * @param {object} properties
         * @param {object} inputs
         * @returns {Array} props
         */
        self.prepareProperties = function(properties, inputs) {

            var props = [];

            /* to through properties */
            _.each(properties, function(property, key) {
                if (!_.isUndefined(inputs[key])) {

                    var value;
                    var prefix = self.parsePrefix(property.adapter.prefix);
                    var separator = self.parseSeparator(prefix, property.adapter.separator);
                    var listSeparator = self.parseListSeparator(property.adapter.listSeparator);

                    /* if input is ARRAY */
                    if (property.type === 'array') {
                        value = self.parseArrayInput(property, inputs[key], prefix, separator, listSeparator);
                        /* if input is FILE */
                    } else if (property.type === 'file') {
                        value = self.applyTransform(property.adapter.transform, inputs[key].path);
                        /* if input is OBJECT */
                    } else if (property.type === 'object') {
                        value = self.parseObjectInput(property.properties, inputs[key]);
                        /* if input is anything else (STRING, INTEGER, BOOLEAN) */
                    } else {
                        value = self.applyTransform(property.adapter.transform, inputs[key]);
                    }

                    props.push(_.merge({key: key, order: property.adapter.order, value: value, prefix: prefix, separator: separator}, property));
                }
            });

            return props;

        };

        /**
         * Recursive method for parsing object input values
         * @param {object} properties
         * @param {object} inputs
         * @returns {string} output
         */
        self.parseObjectInput = function(properties, inputs) {

            var command = [];
            var props = self.prepareProperties(properties, inputs);

            props = _.sortBy(props, 'order');

            /* generate command */
            _.each(props, function(prop) {
                command.push(prop.prefix + prop.separator + prop.value);
            });

            var output = command.join(' ');

            return output;
        };

        /**
         * Generate the command
         *
         * @return {string} output
         */
        self.generateCommand = function() {

            var args = [];
            var command = [];
            var props = self.prepareProperties(self.tool.inputs.properties, self.job.inputs);

            /* to through arguments */
            _.each(self.tool.adapter.args, function(arg, key) {
                var prefix = self.parsePrefix(arg.prefix);
                args.push(_.merge({key: 'arg' + key, order: arg.order, prefix: prefix}, arg));
            });

            var joined = _.sortBy(props.concat(args), 'order');

            /* generate command */
            _.each(joined, function(arg) {

                var separator = self.parseSeparator(arg.prefix, arg.separator);
                var value = _.isUndefined(arg.value) ? '' : arg.value;

                command.push(arg.prefix + separator + value);
            });

            var output = self.tool.adapter.baseCmd.join(' ') + ' ' +
                command.join(' ') +
                ' > ' + self.tool.adapter.stdout;

            self.command = output;

            return output;
        };

        /**
         * Check if old version of structure and if yes erase the store
         * @returns {*}
         */
        self.checkStructure = function() {

            var deferred = $q.defer();

            $localForage.getItem('version')
                .then(function(version) {

                    if (version === 2) {
                        deferred.resolve();
                        return false;
                    }

                    $q.all([
                            $localForage.setItem('version', 2),
                            $localForage.setItem('tool', {}),
                            $localForage.setItem('job', {})
                        ]).then(function() {
                            deferred.resolve();
                        });

                });

            return deferred.promise;

        };

        return self;


    }]);