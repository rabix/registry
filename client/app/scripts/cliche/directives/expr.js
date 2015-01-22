/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('expr', ['$templateCache', function ($templateCache) {

        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/expr.html'),
            scope: {
                ngModel: '=',
                type: '@',
                index: '@',
                placeholder: '@',
                self: '@',
                selfType: '=?',
                selfItemType: '=?',
                onlyExpr: '@',
                handleItemUpdate: '&'
            },
            controller: ['$scope', '$modal', 'SandBox', 'Helper', function ($scope, $modal, SandBox, Helper) {

                $scope.view = {};
                $scope.view.model = $scope.ngModel;
                $scope.view.placeholder = $scope.placeholder || 'Enter value';
                $scope.view.type = $scope.type || 'string';

                $scope.view.exprError = '';

                /**
                 * Check if expression is valid
                 */
                var checkExpression = function () {

                    if ($scope.view.model && $scope.view.model.$expr) {

                        var self = $scope.self ? {$self: Helper.getTestData($scope.selfType, $scope.selfItemType)} : {};

                        SandBox.evaluate($scope.view.model.$expr, self)
                            .then(function () {
                                $scope.view.exprError = '';
                            }, function (error) {
                                $scope.view.exprError = error.name + ':' + error.message;
                            });
                    } else {
                        $scope.view.exprError = '';
                    }

                };

                /* init check of the expression if defined */
                checkExpression();

                // legacy structure, can be deleted later
                if ($scope.view.model && $scope.view.model.expr) {
                    $scope.view.model.$expr = $scope.view.model.expr;
                    delete $scope.view.model.expr;
                }

                $scope.$watch('view.model', function (n, o) {
                    if (n !== o) {
                        checkExpression();
                        if (_.isUndefined($scope.handleItemUpdate)) {
                            $scope.ngModel = n;
                        } else {
                            $scope.handleItemUpdate({index: $scope.index, value: n});
                        }
                    }
                });

                $scope.$watch('view.model.$expr', function (n, o) {
                    if (n !== o) {
                        checkExpression();
                        $scope.handleItemUpdate({index: $scope.index, value: $scope.view.model});
                    }
                });

                $scope.$watch('selfType', function (n, o) { if (n !== o) { checkExpression(); } });

                $scope.$watch('selfItemType', function (n, o) { if (n !== o) { checkExpression(); } });

                $scope.$watch('ngModel', function (n, o) {
                    if (n !== o) {
                        checkExpression();
                        $scope.view.model = n;
                    }
                });

                /**
                 * Edit custom expression for input value evaluation
                 */
                $scope.editExpression = function () {

                    var expr = _.isObject($scope.view.model) ? $scope.view.model.$expr : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/edit-expression.html'),
                        controller: 'ExpressionCtrl',
                        windowClass: 'modal-expression',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            options: function () {
                                return {
                                    expr: expr,
                                    self: $scope.self ? true : false
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function (expr) {
                        if (_.isEmpty(expr)) {
                            $scope.view.model = '';
                        } else {
                            if (!_.isObject($scope.view.model)) {
                                $scope.view.model = {};
                            }
                            $scope.view.model.$expr = expr;
                        }
                    });


                };

            }],
            link: function() {}
        };
    }]);