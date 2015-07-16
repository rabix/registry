'use strict';

angular.module('registryApp.common')
    .filter('isEmpty', [function() {
        return function(object) {

            return _.isEmpty(object);

        };
    }]);