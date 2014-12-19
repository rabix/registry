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
                appName: '@',
                exposed: '='
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope) {

                    var keyName = scope.appName + '.' + scope.key;

                    scope.view = {};

                    scope.view.expose = scope.exposed ? !_.isUndefined(scope.exposed[keyName]) : false;

                    scope.toggleParams = function () {
                        scope.view.expand = !scope.view.expand;
                    };

                    scope.exposeParams = function () {

                        if (scope.view.expose) {
                            scope.exposed[keyName] = scope.model;
                        } else {
                            delete scope.exposed[keyName];
                        }

                    };

                });
            }
        };
    }]);
