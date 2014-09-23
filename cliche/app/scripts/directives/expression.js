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
                expression: '='
            },
            link: function(scope) {

                scope.expression = Data.getExpression(scope.type, scope.name);

                /**
                 * Toggle evaluation application
                 */
                scope.toggleEvaluation = function () {

                    if (scope.expression.active) {

                        Data.setExpressionArg(scope.type, scope.name, scope.arg);

                        SandBox.evaluate(scope.expression.code, {$self: scope.expression.arg})
                            .then(function (result) {
                                scope.arg = !result && isNaN(result) ? null : result;
                            }, function () {
                                scope.arg = '';
                            });
                    } else {
                        scope.arg = scope.expression.arg;
                    }

                    Data.setExpressionState(scope.type, scope.name, scope.expression.active);

                };

                /* watch for the $self argument to change and initiate evaluation */
                scope.$watch('expression.arg', function (n, o) {
                    if (n !== o) {

//                        if (_.isArray(n)) {
//
//                            var promises = [];
//
//                            _.each(n, function (arg) {
//                                var promise = SandBox.evaluate(scope.expression.code, {$self: arg})
//                                    .then(function (result) {
//                                        return !result && isNaN(result) ? null : result;
//                                    });
//                                promises.push(promise);
//                            });
//
//                            $q.all(promises)
//                                .then(function (args) {
//                                    console.log(args);
//                                    scope.arg = args;
//                                });
//
//                        } else {
                            SandBox.evaluate(scope.expression.code, {$self: scope.expression.arg})
                                .then(function (result) {
                                    scope.arg = !result && isNaN(result) ? null : result;
                                });
//                        }


                        Data.setExpressionArg(scope.type, scope.name, n);
                    }
                });

            }
        };
    }]);