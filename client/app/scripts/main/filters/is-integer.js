'use strict';

angular.module('registryApp')
    .filter('isInteger', [function() {
        return function(num) {

            return num === parseInt(num, 10);

        };
    }]);