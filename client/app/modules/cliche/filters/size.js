/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .filter('size', [function() {
        return function(obj) {

            return _.size(obj);

        };
    }]);