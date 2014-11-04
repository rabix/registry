'use strict';

angular.module('registryApp')
    .directive('error', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/error.html'),
            link: function(scope) {

                scope.errors = [];

                scope.$on('httpError', function (obj, message) {

                    var messages = _.pluck(scope.errors, 'message');

                    if (!_.contains(messages, message.message)) {
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