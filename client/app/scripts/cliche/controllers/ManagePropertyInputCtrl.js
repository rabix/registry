/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyInputCtrl', ['$scope', '$modalInstance', 'Data', 'options', function ($scope, $modalInstance, Data, options) {

        $scope.view = {};
        $scope.view.property = angular.copy(options.property);
        $scope.view.name = options.name;
        $scope.view.required = options.required;
        $scope.view.mode = _.isUndefined($scope.view.property) ? 'add' : 'edit';

        if (_.isUndefined($scope.view.property)) {
            $scope.view.property = {type: 'string'};
        }

        $scope.view.disabled = ($scope.view.property.items && $scope.view.property.items.type) === 'object';
        $scope.view.isEnum = _.isArray($scope.view.property.enum);
        $scope.view.adapter = !_.isUndefined($scope.view.property.adapter);

        var cacheAdapter = {};

        /**
         * Check if input has adapter section and if not add it
         */
        var checkInputAdapter = function() {

            if (_.isUndefined($scope.view.property.adapter) && options.toolType === 'tool') {
                $scope.view.property.adapter = {};
            }

        };

        /**
         * Save property changes
         *
         * @returns {boolean}
         */
        $scope.save = function() {

            $scope.view.error = '';
            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            if ($scope.view.mode === 'edit') {
                $modalInstance.close({prop: $scope.view.property, required: $scope.view.required});
            } else {
                Data.addProperty('input', $scope.view.name, $scope.view.property, options.properties)
                    .then(function() {
                        $modalInstance.close({name: $scope.view.name, required: $scope.view.required});
                    }, function(error) {
                        $scope.view.error = error;
                    });
            }

        };

        /* watch for the type change in order to adjust the property structure */
        $scope.$watch('view.property.type', function(n, o) {
            if (n !== o) {

                Data.transformProperty($scope.view.property, 'input', n);

                if (_.isUndefined($scope.view.property.enum)) {
                    $scope.view.isEnum = false;
                }

            }
        });

        /* watch for the items type change in order to adjust the property structure */
        $scope.$watch('view.property.items.type', function(n, o) {
            if (n !== o) {
                if (n === 'object') {
                    $scope.view.disabled = true;

                    if ($scope.view.mode === 'edit') {
                        options.inputs[$scope.name] = [];
                    }

                    checkInputAdapter();

                    if (_.isUndefined($scope.view.property.items.properties)) {
                        $scope.view.property.items.properties = {};
                        if (options.toolType === 'tool') {
                            $scope.view.property.adapter.prefix = '';
                            $scope.view.property.adapter.itemSeparator = undefined;
                            $scope.view.property.adapter.separator = ' ';
                            $scope.view.property.adapter.value = undefined;
                        }
                    }
                } else {
                    $scope.view.disabled = false;
                    if (!_.isUndefined($scope.view.property.items)) {
                        delete $scope.view.property.items.properties;
                    }
                }
            }
        });

        /**
         * Toggle enum flag
         */
        $scope.toggleEnum = function() {
            if ($scope.view.isEnum) {
                $scope.view.property.enum = [''];
            } else {
                delete $scope.view.property.enum;
            }
        };

        /**
         * Update transform value with expression
         *
         * @param value
         */
        $scope.updateTransform = function (value) {

            checkInputAdapter();

            if (_.isObject(value)) {
                $scope.view.property.adapter.value = value;
            } else {
                delete $scope.view.property.adapter.value;
            }

        };

        /**
         * Toggle adapter definition
         */
        $scope.toggleAdapter = function () {

            if ($scope.view.adapter) {
                $scope.view.property.adapter = cacheAdapter;
            } else {
                cacheAdapter = angular.copy($scope.view.property.adapter);
                delete $scope.view.property.adapter;
            }

        };

        /**
         * Close modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
