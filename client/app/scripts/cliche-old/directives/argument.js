/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ArgumentCtrl', ['$scope', '$templateCache', '$modal', 'SandBox', 'Data', function ($scope, $templateCache, $modal, SandBox, Data) {

        $scope.view = {};
        $scope.view.tpl = 'views/cliche/property/property-argument.html';

        $scope.view.exprError = '';

        /**
         * Check if expression is valid
         */
        var checkExpression = function () {

            if ($scope.prop.value && $scope.prop.value.$expr) {

                SandBox.evaluate($scope.prop.value.$expr, {})
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

        /**
         * Toggle argument box visibility
         */
        $scope.toggle = function() {
            $scope.active = !$scope.active;
        };

        /**
         * Remove particular property
         */
        $scope.remove = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                Data.deleteProperty('arg', $scope.name, $scope.properties);
                Data.generateCommand();
            });
        };

        /**
         * Edit property
         */
        $scope.edit = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/manage-property-arg.html'),
                controller: 'ManagePropertyArgCtrl',
                windowClass: 'modal-prop',
                size: 'lg',
                resolve: {
                    options: function () {
                        return {
                            type: 'arg',
                            name: $scope.name,
                            property: $scope.prop,
                            properties: $scope.properties
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {

                _.each(result.prop, function(value, key) {
                    $scope.prop[key] = value;
                });

                checkExpression();
                Data.generateCommand();
            });

            return modalInstance;

        };

        /**
         * Handle actions initiated from the property header
         *
         * @param action
         */
        $scope.handleAction = function(action) {

            if (typeof $scope[action] === 'function') {
                $scope[action]();
            }
        };

    }])
    .directive('argument', [function () {

        return {
            restrict: 'E',
            template: '<div class="property-box" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                properties: '='
            },
            controller: 'ArgumentCtrl',
            link: function() {}
        };
    }]);