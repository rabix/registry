'use strict';

angular.module('clicheApp')
    .filter('contains', [function() {
        return function(array, element) {

            return _.contains(array, element);

        };
    }]);