/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.common')
    .directive('expr', ['$templateCache', function ($templateCache) {

        return {
            restrict: 'E',
            template: $templateCache.get('views/partials/expr.html'),
            scope: {
                ngModel: '=',
                type: '@',
                index: '@',
                placeholder: '@',
                self: '@',
                selfType: '=?',
                selfItemType: '=?',
                onlyExpr: '@',
                handleItemUpdate: '&',
                handleItemBlur: '&'
            },
            controller: ['$scope', '$modal', 'SandBox', 'Helper', 'rawTransform', function ($scope, $modal, SandBox, Helper, rawTransform) {

                $scope.view = {};

                $scope.view.placeholder = $scope.placeholder || 'Enter value';
                $scope.view.type = $scope.type || 'string';

                $scope.view.exprError = '';

                /**
                 * Determine if model is object with defined transformation or literal
                 */
                var determineStructure = function() {

                    if ($scope.ngModel && $scope.ngModel.value) {
                        $scope.view.mode = 'transform';
                        $scope.view.transform = $scope.ngModel;
                        $scope.view.literal = null;
                    } else {
                        $scope.view.mode = 'literal';
                        $scope.view.literal = $scope.ngModel;
                        $scope.view.transform = null;
                    }

                };

                /* init structure determine */
                determineStructure();

                /**
                 * Check if expression is valid
                 */
                var checkExpression = function () {

                    if ($scope.view.mode === 'transform') {

                        var self = $scope.self ? {$self: Helper.getTestData($scope.selfType, $scope.selfItemType)} : {};

                        SandBox.evaluate($scope.view.transform.value, self)
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

                $scope.$watch('ngModel', function (n, o) {
                    if (n !== o) {
                        determineStructure();
                        checkExpression();
                    }
                });

                /**
                 * Trigger the update on the outside
                 *
                 * @param {String} n
                 * @param {String} o
                 * @param {String} mode - 'literal' | 'transform'
                 */
                var triggerUpdate = function(n, o, mode) {

                    if (n !== o && !_.isNull(n) && !_.isUndefined(n)) {

                        checkExpression();

                        if (!_.isUndefined($scope.handleItemUpdate)) {
                            $scope.handleItemUpdate({index: $scope.index, value: $scope.view[mode]});
                        }
                    }

                };

                $scope.$watch('view.transform.value', function (n, o) {
                    triggerUpdate(n, o, 'transform');
                });

                $scope.$watch('view.literal', function (n, o) {
                    triggerUpdate(n, o, 'literal');
                });

                $scope.$watch('selfType', function (n, o) { if (n !== o) { checkExpression(); } });

                $scope.$watch('selfItemType', function (n, o) { if (n !== o) { checkExpression(); } });

                /**
                 * Edit custom expression for input value evaluation
                 */
                $scope.editExpression = function () {

                    var expr = $scope.view.mode === 'transform' ? $scope.view.transform.value : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/edit-expression.html'),
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

                            $scope.view.mode = 'literal';
                            $scope.view.transform = null;
                            $scope.view.literal = '';

                        } else {

                            $scope.view.mode = 'transform';

                            if (!_.isObject($scope.view.transform)) { $scope.view.transform = rawTransform; }
                            $scope.view.transform.value = expr;
                            $scope.view.literal = null;
                        }

                    });


                };

            }],
            link: function(scope, element) {
                var el = angular.element(element);

                el.find('input').on('blur', function() {
                    if (!_.isUndefined(scope.handleItemBlur) && scope.view.mode === 'literal') {
                        scope.handleItemBlur({index: scope.index, value: scope.view.literal});
                    }
                });

                scope.$on('$destroy', function() {
                    el.off('blur');
                });
            }
        };
    }]);