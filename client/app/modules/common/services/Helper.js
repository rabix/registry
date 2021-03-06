/**
 * Author: Milica Kadic
 * Date: 1/14/15
 * Time: 4:23 PM
 */

'use strict';

angular.module('registryApp.common')
    .factory('Helper', ['$injector', function($injector) {

        /**
         * Check if name is valid
         *
         * @param {string} name
         * @returns {boolean}
         */
        var isValidName = function (name, whiteSpace) {

            if (_.isEmpty(name)) { return false; }

            var pattern = /[\$\-\.]/g;

            if (whiteSpace) {
                pattern = /[\$\.\-\s]/g;
            }

            return !pattern.test(name);

        };

        var hasWhiteSpace = function (name) {

            if (_.isEmpty(name)) { return false; }

            return /\s/.test(name);
        };

        /**
         * Check if value is integer
         *
         * @param {integer} int
         * @returns {boolean}
         */
        var isValidInt = function(int) {

            int = int || 0;

            return int === parseInt(int, 10);

        };

        /**
         * Get current domain with appropriate protocol and port
         *
         * @returns {string}
         */
        var getDomain = function () {

            var $location = $injector.get('$location');

            var port = $location.port() ? (':' + $location.port()) : '';

            return $location.protocol() + '://' + $location.host() + port;

        };

        /**
         * Test data for the $self context of the expression
         *
         * @param {string} type
         * @param {string} itemType
         * @returns {*}
         */
        var getTestData = function (type, itemType) {

            var output;
            var map = {
                File: {
                    path: 'i-am-file.txt',
                    'class': 'classname',
                    secondaryFiles: [
                        'file1', 'file2'
                    ],
                    size: 1234
                },
                directory: 'dir-me-dir-me-a-man_after_midnight',
                string: 'test',
                int: 42,
                float: 332.1234242,
                boolean: false,
                array: {
                    File: {
                        path: 'i-am-file.txt',
                        'class': 'classname',
                        secondaryFiles: [
                            'file1', 'file2'
                        ],
                        size: 1234
                    },
                    directory: 'dir-me-dir-me-a-man_after_midnight',
                    string: 'test',
                    int: 42,
                    float: 332.1234242
                }
            };

            output = map[type];

            if (itemType) { output = output[itemType]; }

            return output;

        };

        /**
         * Get default input value when creating new input
         *
         * @param {string} name
         * @param {array} symbols
         * @param {string} type
         * @param {string} itemType
         * @returns {*}
         */
        var getDefaultInputValue = function (name, symbols, type, itemType) {

            var output;
            var map = {
                file: {path: name + '.ext', 'class': 'File', size: 0, secondaryFiles: []},
                File: {path: name + '.ext', 'class': 'File', size: 0, secondaryFiles: []},
                'enum': symbols ? symbols[0] : name,
                string: name,
                int: 0,
                float: 0,
                boolean: true,
                array: {
                    file: [{path: name + '.ext', 'class': 'File', size: 0, secondaryFiles: []}],
                    File: [{path: name + '.ext', 'class': 'File', size: 0, secondaryFiles: []}],
                    string: [name],
                    int: [0],
                    float: [0],
                    record: []
                }
            };

            output = map[type];

            if (itemType) { output = output[itemType]; }

            return output;

        };

        /**
         * Stop propagation
         *
         * @param e
         */
        var stopPropagation = function(e) {

            if (_.isUndefined(e)) {
                return false;
            }

            if (typeof e.stopPropagation === 'function') {
                e.stopPropagation();
            }
            if (typeof e.cancelBubble !== 'undefined') {
                e.cancelBubble = true;
            }

        };

        function deepPropValue (obj, prop) {
            var result = null;

            if (obj instanceof Array) {
                for(var i = 0; i < obj.length; i ++) {
                    result = deepPropertyExists(obj[i], prop);
                    if (result) {
                        break;
                    }
                }
            } else {
                for (var oProp in obj) {
                    if (!obj.hasOwnProperty(oProp)) {
                        continue;
                    }
                    if (oProp === prop) {
                        return obj;
                    }
                    if(obj[oProp] instanceof Object || obj[oProp] instanceof Array) {
                        result = deepPropertyExists(obj[oProp], prop);
                        if (result) {
                            break;
                        }
                    }
                }
            }

            return result;
        }

        /**
         *
         */
        var deepPropertyExists = function(obj, prop) {
            return !! deepPropValue(obj, prop);
        };

        var deepPropertyEquals = function(obj, prop, val) {
            return deepPropValue(obj, prop) === val;
        };

        return {
            isValidName: isValidName,
            isValidInt: isValidInt,
            getDomain: getDomain,
            getTestData: getTestData,
            getDefaultInputValue: getDefaultInputValue,
            stopPropagation: stopPropagation,
            deepPropertyExists: deepPropertyExists,
            deepPropertyEquals: deepPropertyEquals
        };

    }]);