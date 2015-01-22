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
        var isValidName = function (name) {

            if (_.isEmpty(name)) { return false; }

            var pattern = /[\$\.]/g;

            return !pattern.test(name);

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
                file: 'i-am-file.txt',
                directory: 'dir-me-dir-me-a-man_after_midnight',
                string: 'test',
                integer: 42,
                number: 332.1234242,
                boolean: false,
                array: {
//                    file: ['text-file.txt', 'output.sam'],
//                    directory: ['one-dir', 'other-dir', 'one-another-dir_with_underscore'],
//                    string: ['small', 'string', 'that', 'becomes-huge'],
//                    integer: [1, 2, 42, 404, 1000],
//                    number: [4.3, 23.2133, 3, 2.4441, 111.31]
                    file: 'i-am-file.txt',
                    directory: 'dir-me-dir-me-a-man_after_midnight',
                    string: 'test',
                    integer: 42,
                    number: 332.1234242
                }
            };

            output = map[type];

            if (itemType) {
                output = output[itemType];
            }

            return output;

        };

        return {
            isValidName: isValidName,
            getDomain: getDomain,
            getTestData: getTestData
        };

    }]);