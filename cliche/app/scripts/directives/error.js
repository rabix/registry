'use strict';

angular.module('clicheApp')
    .directive('error', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/error.html'),
            link: function(scope) {

                scope.errors = [];

                scope.$on('httpError', function (obj, message) {
                    if (scope.errors.indexOf(message) === -1) {
                        scope.errors.push(message);
                    }
                });

                /**
                 * Close the error alert
                 */
                scope.closeErrors = function () {
                    scope.errors = [];
                };

            }
        };
    }]);