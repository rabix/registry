'use strict';

angular.module('clicheApp')
    .directive('expr', ['$templateCache', '$modal', function ($templateCache, $modal) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/expr.html'),
            scope: {
                ngModel: '=',
                index: '@',
                handleItemUpdate: '&'
            },
            link: function(scope) {

                scope.view = {};
                scope.view.model = scope.ngModel;

                scope.$watch('view.model', function (n, o) {
                    if (n !== o) {
                        if (_.isUndefined(scope.handleItemUpdate)) {
                            scope.ngModel = n;
                        } else {
                            scope.handleItemUpdate({index: scope.index, value: n});
                        }
                    }
                });

                /**
                 * Edit custom expression for input value evaluation
                 */
                scope.editExpression = function () {

                    var expr = _.isObject(scope.view.model) ? scope.view.model.expr : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/edit-expression.html'),
                        controller: 'ExpressionCtrl',
                        windowClass: 'modal-expression',
                        resolve: {
                            options: function () {
                                return {
                                    expr: expr
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
                            scope.view.model.expr = expr;
                        }

                    });

                };

            }
        };
    }]);