/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('PropertyOutputCtrl', ['$scope', '$modal', '$q', '$templateCache', 'Cliche', 'Helper', 'SandBox', function ($scope, $modal, $q, $templateCache, Cliche, Helper, SandBox) {

        $scope.key = $scope.key || 'name';

        $scope.view = {};
        $scope.view.exprError = '';

        /**
         * Parse structure of the property
         * - get property schema
         * - transform type to literal
         * - transform required to boolean
         * - load appropriate template
         */
        var parseStructure = function() {

            $scope.view.property = Cliche.getSchema('output', $scope.prop, $scope.type, true);
            $scope.view.name = Cliche.parseName($scope.prop);
            $scope.view.type = Cliche.parseType($scope.view.property);
            $scope.view.required = Cliche.isRequired($scope.view.property);
            $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.property);

            var tplType = Cliche.getTplType($scope.view.type);

            $scope.view.tpl = 'views/cliche/property/property-output-' + $scope.type + '-' + tplType  + '.html';
        };

        /* init parse structure */
        parseStructure();

        /**
         * Check if expression is valid
         */
        var checkExpression = function () {

            if ($scope.view.property.outputBinding && $scope.view.property.outputBinding.glob && $scope.view.property.outputBinding.glob.value) {

                SandBox.evaluate($scope.view.property.outputBinding.glob.value, {})
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
         * Toggle property box visibility
         */
        $scope.toggle = function() {
            $scope.active = !$scope.active;
        };

        /**
         * Edit property
         */
        $scope.edit = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/manage/' + $scope.type + '-output.html'),
                controller: 'ManagePropertyOutputCtrl',
                windowClass: 'modal-prop',
                size: 'lg',
                resolve: {
                    options: function () {
                        return {
                            mode: 'edit',
                            key: $scope.key,
                            toolType: $scope.type,
                            property: $scope.prop,
                            properties: $scope.properties,
                            required: $scope.view.required
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {

                Cliche.copyPropertyParams(result.prop, $scope.prop);

                parseStructure();
                checkExpression();

                Cliche.generateCommand();

            });

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
                Cliche.deleteProperty($scope.key, $scope.view.name, $scope.properties);
                Cliche.generateCommand();
            });
        };

        /**
         * Handle actions initiated from the property header
         *
         * @param action
         */
        $scope.handleAction = function(action) {

            if (typeof $scope[action] === 'function') { $scope[action](); }
        };

    }])
    .directive('propertyOutput', [function () {

        return {
            restrict: 'E',
            template: '<div class="property-box" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                type: '@',
                key: '@',
                prop: '=ngModel',
                properties: '='
            },
            controller: 'PropertyOutputCtrl',
            link: function() {}
        };
    }]);