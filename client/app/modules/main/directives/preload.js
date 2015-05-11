/**
 * Author: Milica Kadic
 * Date: 10/20/14
 * Time: 14:26 PM
 */
'use strict';

angular.module('registryApp')
    .directive('preload', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            scope: {},
            template: $templateCache.get('views/partials/preload.html'),
            link: function() {}
        };
    }]);