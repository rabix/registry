'use strict';

angular.module('clicheApp')
    .directive('evaluate', ['$templateCache', '$modal', 'Data', function ($templateCache, $modal, Data) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/evaluate.html'),
            scope: {
                name: '@',
                type: '@',
                itemType: '@',
                index: '@',
                model: '='
            },
            link: function(scope) {

                scope.view = {};
                scope.view.index = scope.index || 0;
                scope.view.expression = Data.getExpression(scope.type, scope.name);

                scope.evaluate = function () {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/evaluate-form.html'),
                        controller: ['$scope', '$modalInstance', 'Data', 'SandBox', 'options', function($scope, $modalInstance, Data, SandBox, options) {

                            $scope.view = {};
                            $scope.view.itemType = options.itemType === 'file' ? 'text' : options.itemType;

                            $scope.view.expression = Data.getExpression(options.type, options.name);

                            $scope.view.model = $scope.view.expression.arg[options.index] || options.model;

                            if (_.isArray(options.model)) {

                                $scope.form = {
                                    arg: [],
                                    isArray: true
                                };
                                _.each($scope.view.model, function (arg) {
                                    $scope.form.arg.push({value: arg});
                                });
                            } else {
                                $scope.form = {
                                    arg: $scope.view.model
                                };
                            }

                            /**
                             * Close the modal window
                             */
                            $scope.ok = function () {
                                $modalInstance.close();
                            };

                            /**
                             * On cancel close the modal
                             */
                            $scope.cancel = function () {
                                $modalInstance.dismiss();
                            };

                            $scope.evaluateExpr = function () {

                                //TODO: additional validation here

                                var value = _.isArray($scope.form.arg) ? _.pluck($scope.form.arg, 'value') : $scope.form.arg;

                                Data.setExpressionArg(options.type, options.name, value, options.index);

                                SandBox.evaluateByArg($scope.view.expression.code, value)
                                    .then(function (result) {
                                        $modalInstance.close(result);
                                    });

                            };

                        }],
                        resolve: {
                            options: function () {
                                return {
                                    name: scope.name,
                                    type: scope.type,
                                    model: scope.model,
                                    itemType: scope.itemType,
                                    index: scope.view.index
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {

                        scope.model = (scope.itemType === 'file') ? _.map(result, function(arg) { return {path: arg}; }) : result;

                    });
                };

            }
        };
    }]);