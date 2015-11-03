/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.common')
    .directive('expr', ['$templateCache', '$rootScope', 'ClicheEvents', function ($templateCache, $rootScope, ClicheEvents) {

        return {
            restrict: 'E',
            template: $templateCache.get('modules/common/views/expr.html'),
            scope: {
                ngModel: '=',
                ngDisabled: '=',
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

                    if ($scope.ngModel && $scope.ngModel.script) {
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

                        SandBox.evaluate($scope.view.transform.script, self)
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
                            $rootScope.$broadcast(ClicheEvents.EXPRESSION.CHANGED);
                        }
                    }

                };

                $scope.$watch('view.transform.script', function (n, o) {
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

                    var expr = $scope.view.mode === 'transform' ? $scope.view.transform.script : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('modules/common/views/edit-expression.html'),
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

                            if (!_.isObject($scope.view.transform)) { $scope.view.transform = angular.copy(rawTransform); }
                            $scope.view.transform.script = expr;
                            $scope.view.literal = null;
                        }

                    });


                };

            }],
            link: function(scope, element) {
                var el = angular.element(element);
                // TODO: Check out this, bootstrap tooltip messing with $digest and breaking if you manual trigger
                // focus or anything
                //el.find('input').focus();

                // only set up event handler if event can be handled
                function runHandler(event) {
                    if (event.type === 'keypress' && event.which === 13 || event.type === 'blur' || event.type === 'init' /* for initial load */) {
                        scope.handleItemBlur({index: scope.index, value: scope.view.literal});
                    }
                }

                scope.runHandler = !_.isUndefined(scope.handleItemBlur) && scope.view.mode === 'literal' ? runHandler : angular.noop;

                scope.runHandler({type: 'init'});

            }
        };
    }]);