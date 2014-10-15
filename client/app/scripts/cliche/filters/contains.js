/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .filter('contains', [function() {
        return function(array, element) {

            return _.contains(array, element);

        };
    }]);