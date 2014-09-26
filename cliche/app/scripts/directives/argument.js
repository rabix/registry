'use strict';

angular.module('clicheApp')
    .directive('argument', ['$templateCache', '$modal', 'Data', 'SandBox', function ($templateCache, $modal, Data, SandBox) {

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
                scope.view.expression = Data.getExpression('argument', scope.name);

                SandBox.evaluate(scope.view.expression.code, {})
                    .then(function (result) {
                        scope.arg.value = result;
                    });

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
                        Data.removeExpression('argument', scope.name);
                    });
                };

                /**
                 * Edit custom expression for input value evaluation
                 */
                scope.editExpression = function (e) {

                    e.stopPropagation();

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/edit-expression.html'),
                        controller: 'ExpressionCtrl',
                        windowClass: 'modal-expression',
                        resolve: {
                            options: function () {
                                return {
                                    name: scope.name,
                                    namespace: scope.name,
                                    type: 'argument',
                                    self: false
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function (code) {
                        SandBox.evaluate(code, {})
                            .then(function (result) {
                                scope.arg.value = result;
                            });

                    });

                };

            }
        };
    }]);