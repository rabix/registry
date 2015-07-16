'use strict';

angular.module('registryApp.common')
    .filter('encode', [function() {
        return function(string) {

            return string.replace(/\//g, '&');

        };
    }]);