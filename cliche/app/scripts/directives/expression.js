'use strict';

angular.module('clicheApp')
    .directive('expression', ['$templateCache', '$q', 'Data', 'SandBox', function ($templateCache, $q, Data, SandBox) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/expression.html'),
            scope: {
                name: '@',
                type: '@',
                arg: '=',
                expression: '=',
                index: '@'
            },
            link: function(scope) {

                scope.view = {};

                scope.expression = Data.getExpression(scope.type, scope.name);
                scope.index = scope.index || 0;
                scope.arg = scope.arg || '';

                /**
                 * Toggle evaluation application
                 */
                scope.toggleEvaluation = function () {

                    if (scope.expression.active[scope.index]) {

                        Data.setExpressionArg(scope.type, scope.name, scope.arg, scope.index);

                        if (_.isArray(scope.arg)) {
                            _.each(scope.arg, function (arg, index) {
                                SandBox.evaluate(scope.expression.code, {$self: arg})
                                    .then(function (result) {
                                        scope.arg[index] = !result && isNaN(result) ? null : result;
                                    });
                            });
                        } else {
                            SandBox.evaluate(scope.expression.code, {$self: scope.arg})
                                .then(function (result) {
                                    scope.arg = !result && isNaN(result) ? null : result;
                                });
                        }


                    } else {
                        scope.arg = scope.expression.arg[scope.index];
                    }

                    Data.setExpressionState(scope.type, scope.name, scope.expression.active[scope.index], scope.index);

                };

            }
        };
    }]);