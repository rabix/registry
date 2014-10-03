'use strict';

angular.module('clicheApp')
    .filter('size', [function() {
        return function(obj) {

            return _.size(obj);

        };
    }]);