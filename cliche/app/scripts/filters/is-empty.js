'use strict';

angular.module('clicheApp')
    .filter('isEmpty', [function() {
        return function(object) {

            return _.isEmpty(object);

        };
    }]);