/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyInputCtrl', ['$scope', '$modalInstance', 'Cliche', 'Helper', 'options', function ($scope, $modalInstance, Cliche, Helper, options) {

        var key = options.key || 'name';

        $scope.view = {};
        $scope.view.key = key;
        $scope.view.property = angular.copy(options.property);
        $scope.view.mode = _.isUndefined($scope.view.property) ? 'add' : 'edit';

        if (_.isUndefined($scope.view.property)) { $scope.view.property = {type: 'string'}; }

        $scope.view.required = Cliche.isRequired($scope.view.property.type);
        $scope.view.type = Cliche.parseType($scope.view.property.type);
        $scope.view.items = Cliche.getItemsRef(key, $scope.view.type, $scope.view.property);

        var tmp = Cliche.parseEnum($scope.view.property.type);

        $scope.view.enumName = tmp.name;
        $scope.view.symbols = tmp.symbols;

        $scope.view.disabled = ($scope.view.items && $scope.view.items.type) === 'record';

        var cacheAdapter = {};

        /**
         * Check if input has adapter section and if not add it
         */
        var checkInputAdapter = function() {

            if (_.isUndefined($scope.view.property.adapter) && options.toolType === 'tool') {
                $scope.view.property.adapter = {separator: ' '};
            }

        };

        if ($scope.view.mode === 'add') {

            if (options.toolType === 'tool') {
                $scope.view.adapter = true;
                if (_.isUndefined($scope.view.property.adapter)) {
                    $scope.view.property.adapter = {separator: ' '};
                }
            } else {
                $scope.view.adapter = false;
                delete $scope.view.property.adapter;
            }

        } else {
            $scope.view.adapter = !_.isUndefined($scope.view.property.adapter);
        }

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

            var inner = {
                key: key,
                required: $scope.view.required,
                type: $scope.view.type,
                enumName: $scope.view.enumName,
                symbols: $scope.view.symbols,
                items: $scope.view.items
            };

            $scope.view.property = Cliche.formatProperty(inner, $scope.view.property);

            if ($scope.view.mode === 'edit') {
                $modalInstance.close({prop: $scope.view.property});
            } else {

                if (options.toolType === 'tool') {

                    if (!_.isArray(options.inputs)) {
                        options.inputs[$scope.view.property[key]] = Helper.getDefaultInputValue(
                            $scope.view.property[key],
                            $scope.view.symbols,
                            $scope.view.type,
                            ($scope.view.items ? $scope.view.items.type : null)
                        );
                    }
                }

                Cliche.addProperty('input', $scope.view.property, options.properties)
                    .then(function() {
                        $modalInstance.close();
                    }, function(error) {
                        $scope.view.error = error;
                    });
            }

        };

        /* watch for the type change in order to adjust the property structure */
        $scope.$watch('view.type', function(n, o) {
            if (n !== o) {
                if (n === 'array') {
                    if (!$scope.view.items) { $scope.view.items = {}; }
                    $scope.view.items.type = 'string';
                } else {
                    delete $scope.view.items;
                }
            }
        });

        /* watch for the items type change in order to adjust the property structure */
        $scope.$watch('view.items.type', function(n, o) {
            if (n !== o) {
                if (n === 'record') {
                    $scope.view.disabled = true;

                    if ($scope.view.mode === 'edit') {
                        options.inputs[$scope.name] = [];
                    }

                    checkInputAdapter();

                    if (_.isUndefined($scope.view.items.fields)) {
                        $scope.view.items.fields = [];
                        if (options.toolType === 'tool') {
                            $scope.view.property.adapter.prefix = '';
                            $scope.view.property.adapter.separator = ' ';
                            delete $scope.view.property.adapter.itemSeparator;
                            delete $scope.view.property.adapter.argValue;
                        }
                    }
                } else {
                    $scope.view.disabled = false;
                    if (!_.isUndefined($scope.view.items)) {
                        delete $scope.view.items.fields;
                    }
                }
            }
        });

        /**
         * Update transform value with expression
         *
         * @param value
         */
        $scope.updateTransform = function (value) {

            checkInputAdapter();

            if (_.isObject(value)) {
                $scope.view.property.adapter.argValue = value;
            } else {
                delete $scope.view.property.adapter.argValue;
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
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
