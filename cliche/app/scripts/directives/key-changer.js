'use strict';

angular.module('clicheApp')
    .directive('keyChanger', ['$templateCache', '$timeout', function ($templateCache, $timeout) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/key-changer.html'),
            scope: {
                key: '=',
                items: '='
            },
            link: function(scope, element) {

                var timeoutId;
                scope.view = {};

                /**
                 * Init key edit and focus the input for key editing
                 */
                scope.initUpdateMetaKey = function () {

                    scope.view.metaKey = scope.key;
                    scope.view.oldKey = angular.copy(scope.key);

                    scope.cancelTimeout();
                    timeoutId = $timeout(function () {
                        var input = element[0].querySelector('.meta-key-value');
                        input.focus();
                    }, 100);

                };

                /**
                 * Update meta key
                 *
                 * @returns {boolean}
                 */
                scope.updateMetaKey = function () {


                    scope.view.error = false;

                    if (scope.view.metaKey === scope.view.oldKey) {
                        scope.view.metaKey = '';
                        return false;
                    }

                    if (!_.isUndefined(scope.items[scope.view.metaKey]) || scope.view.metaKey === '') {
                        scope.view.error = true;
                        return false;
                    }

                    scope.items[scope.view.metaKey] = scope.items[scope.view.oldKey];
                    delete scope.items[scope.view.oldKey];
                    scope.view.metaKey = '';

                };

                /**
                 * Cancel timeout used for input focus
                 */
                scope.cancelTimeout = function () {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

                scope.$on('$destroy', function () {
                    scope.cancelTimeout();
                });

            }
        };
    }]);