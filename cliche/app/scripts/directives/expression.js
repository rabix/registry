'use strict';

angular.module('clicheApp')
    .directive('expression', ['$templateCache', 'Data', function ($templateCache, Data) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/expression.html'),
            scope: {
                name: '@',
                type: '@',
                arg: '='
            },
            link: function(scope) {

                scope.view = {};
                scope.view.expression = Data.getExpression(scope.type, scope.name);

                Data.setExpressionArg(scope.type, scope.name, scope.arg);

                scope.toggleEval = function () {

//                    scope.view.expression.active = !scope.view.expression.active;

                    if (scope.view.expression.active) {
                        scope.arg = scope.arg + '-transformed';
                    } else {
                        scope.arg = scope.view.expression.arg;
                    }

                    Data.setExpressionState(scope.type, scope.name, scope.view.expression.active);

                };

            }
        };
    }]);