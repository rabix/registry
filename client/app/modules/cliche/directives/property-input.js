/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('PropertyInputCtrl', ['$scope', '$modal', '$templateCache', 'Cliche', 'Helper', 'SandBox', function ($scope, $modal, $templateCache, Cliche, Helper, SandBox) {

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
            var enumObj, tplType;

            $scope.view.property = $scope.prop;
            $scope.view.schema = Cliche.getSchema('input', $scope.prop, $scope.type, true);
            $scope.view.name = Cliche.parseName($scope.prop);
            $scope.view.required = Cliche.isRequired($scope.view.schema);
            $scope.view.type = Cliche.parseType($scope.view.schema);
            $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.schema);
            $scope.view.adapter = Cliche.getAdapter($scope.prop);

            enumObj = Cliche.parseEnum($scope.view.schema);

            $scope.view.enumName = enumObj.name;
            $scope.view.symbols = enumObj.symbols;

            tplType = Cliche.getTplType($scope.view.type);

            $scope.view.tpl = 'views/cliche/property/property-input-' + $scope.type + '-' + tplType  + '.html';

        };

        /* init parse structure */
        parseStructure();

        if ($scope.view.items && $scope.view.items.type === 'record' && _.isUndefined($scope.view.items.fields)) {
            $scope.view.items.fields = [];
        }

        /**
         * Check if expression is valid
         */
        var checkExpression = function () {

            if ($scope.view.property.adapter && $scope.view.property.adapter.argValue && $scope.view.property.adapter.argValue.value) {

                var itemType = ($scope.view.items && $scope.view.items.type) ? $scope.view.items.type : null;
                var self = {$self: Helper.getTestData($scope.view.type, itemType)};

                SandBox.evaluate($scope.view.property.adapter.argValue.value, self)
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
         * Adjust input object depending of the action
         *
         * @param {string} mode - change or delete
         * @param {string} oldName
         * @param {string} newName
         * @returns {boolean}
         */
        var adjustInputs = function(mode, oldName, newName) {

            if (oldName === newName) { return false; }

            if ($scope.inputs && !_.isUndefined($scope.inputs[oldName])) {
                if (mode === 'change') {
                    $scope.inputs[newName] = angular.copy($scope.inputs[oldName]);
                }
                delete $scope.inputs[oldName];
            }

            if (_.isArray($scope.inputs)) {
                _.each($scope.inputs, function(input) {
                    if (!_.isUndefined(input)) {
                        if (mode === 'change') {
                            input[newName] = angular.copy(input[oldName]);
                        }
                        delete input[oldName];
                    }
                });
            }
        };

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
                template: $templateCache.get('views/cliche/manage/' + $scope.type + '-input.html'),
                controller: 'ManagePropertyInputCtrl',
                windowClass: 'modal-prop',
                size: 'lg',
                resolve: {
                    options: function () {
                        return {
                            mode: 'edit',
                            key: $scope.key,
                            toolType: $scope.type,
                            property: $scope.prop,
                            properties: $scope.properties
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {

                var oldName = $scope.view.name;

                Cliche.copyPropertyParams(result.prop, $scope.prop);

                parseStructure();
                checkExpression();

                adjustInputs('change', oldName, $scope.view.name);

                $scope.handler();

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

                adjustInputs('delete', $scope.view.name);

                $scope.handler();

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
    .directive('propertyInput', ['$templateCache', 'RecursionHelper', function ($templateCache, RecursionHelper) {

        return {
            restrict: 'E',
            template: '<div class="property-box {{ type }}" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                type: '@',
                key: '@',
                prop: '=ngModel',
                properties: '=',
                inputs: '=',
                handler: '&'
            },
            controller: 'PropertyInputCtrl',
            compile: function(element) {
                return RecursionHelper.compile(element, function() {});
            }
        };
    }]);