'use strict';

angular.module('clicheApp')
    .filter('trim', [function() {
        return function(string) {

            return string.trim();

        };
    }]);