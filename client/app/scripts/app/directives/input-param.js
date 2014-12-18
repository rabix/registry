/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 6:21 PM
 */
'use strict';

angular.module('registryApp.app')
    .directive('inputParam', ['$templateCache', 'RecursionHelper', function($templateCache, RecursionHelper) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/app/partials/input-param.html'),
            scope: {
                model: '=ngModel',
                key: '@'
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function() {

                });
            }
        };
    }]);
