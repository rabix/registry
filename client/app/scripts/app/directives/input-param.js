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
                key: '@',
                exposable: '@'
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope) {

                    scope.view = {};

                    scope.exposable = scope.exposable === 'true';

                    scope.toggleParams = function () {
                        scope.view.expand = !scope.view.expand;
                    };

                });
            }
        };
    }]);
