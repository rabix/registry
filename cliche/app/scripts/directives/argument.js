'use strict';

angular.module('clicheApp')
    .directive('argument', ['$templateCache', '$modal', 'Data', function ($templateCache, $modal, Data) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/argument.html'),
            scope: {
                name: '@',
                arg: '=ngModel',
                active: '=',
                form: '=',
                properties: '=',
                valuesFrom: '='
            },
            link: function(scope) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;

                if (!_.isUndefined(scope.arg.valueFrom)) {
                    scope.arg.value = scope.valuesFrom[scope.arg.valueFrom];
                }

                /**
                 * Toggle argument box visibility
                 */
                scope.toggleArgument = function() {
                    scope.active = !scope.active;
                };

                /**
                 * Update the value if value from is changed
                 */
                scope.changeValueFrom = function() {
                    scope.arg.value = scope.valuesFrom[scope.arg.valueFrom];
                };

                scope.$watch('arg.value', function(n, o) {
                    if (n !== o && !_.isEmpty(n)) {
                        scope.arg.valueFrom = null;
                    }
                });

                /**
                 * Remove particular property
                 * @param e
                 */
                scope.removeItem = function(e) {

                    e.stopPropagation();

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/confirm-delete.html'),
                        controller: 'ModalCtrl',
                        windowClass: 'modal-confirm',
                        resolve: {data: function () { return {}; }}
                    });

                    modalInstance.result.then(function () {
                        Data.deleteProperty('arg', scope.name, scope.properties);
                    });
                };

            }
        };
    }]);