/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('expr', ['$templateCache', '$modal', function ($templateCache, $modal) {

        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/expr.html'),
            scope: {
                ngModel: '=',
                type: '@',
                index: '@',
                placeholder: '@',
                self: '@',
                onlyExpr: '@',
                handleItemUpdate: '&'
            },
            link: function(scope) {

                scope.view = {};
                scope.view.model = scope.ngModel;
                scope.view.placeholder = scope.placeholder || 'Enter value';
                scope.view.type = scope.type || 'string';

                scope.$watch('view.model', function (n, o) {
                    if (n !== o) {
                        if (_.isUndefined(scope.handleItemUpdate)) {
                            scope.ngModel = n;
                        } else {
                            scope.handleItemUpdate({index: scope.index, value: n});
                        }
                    }
                });

                scope.$watch('view.model.expr.value', function (n, o) {
                    if (n !== o) {
                        scope.handleItemUpdate({index: scope.index, value: scope.view.model});
                    }
                });

                scope.$watch('ngModel', function (n, o) {
                    if (n !== o) { scope.view.model = n; }
                });

                /**
                 * Edit custom expression for input value evaluation
                 */
                scope.editExpression = function () {

                    var expr = _.isObject(scope.view.model) ? scope.view.model.expr.value : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/edit-expression.html'),
                        controller: 'ExpressionCtrl',
                        windowClass: 'modal-expression',
                        backdrop: 'static',
                        resolve: {
                            options: function () {
                                return {
                                    expr: expr,
                                    self: scope.self ? true : false
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function (expr) {
                        if (_.isEmpty(expr)) {
                            scope.view.model = '';
                        } else {
                            if (!_.isObject(scope.view.model)) {
                                scope.view.model = {};
                            }
                            scope.view.model.expr = {value: expr, lang: 'javascript'};
                        }
                    });


                };

            }
        };
    }]);