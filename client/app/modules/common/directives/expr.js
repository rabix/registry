/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.common')
    .directive('expr', ['$templateCache', function ($templateCache) {
        /**
         * @ngdoc directive
         * @name expr
         * @module registryApp.common
         *
         * @restrict E
         *
         * @description
         * `<expr>` allows expressions as well as literals to be written to input fields.
         *
         * @usage
         * <expr ng-model="model" handle-item-update="updateCallback(value, index)" [handle-item-blur="blurCallback(value, index)"]></expr>
         *
         * @param {string} ngModel Assignable angular expression. Will either be string or transform object.
         * @param {string=} ngDisabled Assignable angular expression.
         * @param {string=} index Index of item.
         * @param {string=} placeholder String to be used as a placeholder
         * @param {object=} self Object exposed as $self to expression
         * @param {string=} selfType
         * @param {string=} selfItemType
         * @param {boolean=} onlyExpr Disables literals
         *
         * @param {array=} options Sets the input to a <select>. Each option is an object with the following format:
         *
         * ```
         *  {
         *      key: 'key',
         *      value: 'value'
         *  }
         * ```
         *
         * The value attribute is displayed as text in the <option> element, while the key will be written to the ngModel
         *
         * @param {Function=} handleItemUpdate Function to be called on item update. Accepts to named parameters:
         *  - `value`: value currently in the field
         *  - `index`: index provided to directive
         *
         * @param {Function=} handleItemUpdate Function to be called on the field's blur event. Accepts the same named parameters as above
         *
         */
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
                options: '=',
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
                    } else if ($scope.options) {
                        $scope.view.mode = 'select';
                        $scope.view.literal = $scope.ngModel;
                        $scope.view.transform = null;
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
                 * @param {String} mode - 'literal' | 'transform' | 'select'
                 */
                var triggerUpdate = function(n, o, mode) {

                    if (n !== o && !_.isNull(n) && !_.isUndefined(n)) {

                        checkExpression();

                        if (!_.isUndefined($scope.handleItemUpdate)) {
                            $scope.handleItemUpdate({index: $scope.index, value: $scope.view[mode]});
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
                    var prevMode = $scope.view.mode;
                    var defaultLiteral = $scope.options ? $scope.options[0].key : '';

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

                            $scope.view.mode = prevMode !== 'transform' ? prevMode : 'literal';
                            $scope.view.transform = null;
                            $scope.view.literal = defaultLiteral;

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