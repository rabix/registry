/**
 * Author: Milica Kadic
 * Date: 1/14/15
 * Time: 4:23 PM
 */

'use strict';

angular.module('registryApp.common')
    .factory('Helper', [function() {

        /**
         * Check if name is valid
         *
         * @param {string} name
         * @returns {boolean}
         */
        var isValidName = function (name) {

            if (_.isEmpty(name)) {
                return false;
            }

            var forbidden = ['#', '.'];

            var isValid = true;

            _.each(forbidden, function (char) {
                if (_.contains(name, char)) {
                    isValid = false;
                    return false;
                }
            });

            return isValid;

        };

        return {
            isValidName: isValidName
        };

    }]);