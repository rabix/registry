/**
 * Author: Milica Kadic
 * Date: 10/20/14
 * Time: 14:26 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('preload', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            scope: {},
            template: $templateCache.get('modules/common/views/preload.html'),
            link: function() {}
        };
    }]);