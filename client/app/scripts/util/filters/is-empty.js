'use strict';

angular.module('registryApp.util')
    .filter('isEmpty', [function() {
        return function(object) {

            return _.isEmpty(object);

        };
    }]);