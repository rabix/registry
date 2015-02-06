/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyInputCtrl', ['$scope', '$modalInstance', 'Cliche', 'Helper', 'options', function ($scope, $modalInstance, Cliche, Helper, options) {

        var key = options.key || 'name';
        var idObj = {n: '', o: ''};
        var cacheAdapter = {};

        $scope.view = {};
        $scope.view.key = key;
        $scope.view.mode = options.mode;
        $scope.view.property = Cliche.getSchema('input', options.property, options.toolType);
        $scope.view.name = Cliche.parseName(key, options.property);
        $scope.view.required = Cliche.isRequired($scope.view.property.type);
        $scope.view.type = Cliche.parseType($scope.view.property.type);
        $scope.view.items = Cliche.getItemsRef(key, $scope.view.type, $scope.view.property);

        $scope.view.types = Cliche.getTypes('input');
        $scope.view.itemTypes = Cliche.getTypes('inputItem');

        var enumObj = Cliche.parseEnum($scope.view.property.type);

        $scope.view.enumName = enumObj.name;
        $scope.view.symbols = enumObj.symbols;

        $scope.view.disabled = ($scope.view.items && $scope.view.items.type) === 'record';
        $scope.view.adapter = !_.isUndefined($scope.view.property.adapter);

        idObj.o = $scope.view.name;

        /**
         * Save property changes
         *
         * @returns {boolean}
         */
        $scope.save = function() {

            $scope.view.error = '';
            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) { return false; }

            var inner = {
                key: key,
                name: $scope.view.name,
                required: $scope.view.required,
                type: $scope.view.type,
                enumName: $scope.view.enumName,
                symbols: $scope.view.symbols,
                items: $scope.view.items
            };

            var formatted = Cliche.formatProperty(inner, $scope.view.property);

            idObj.n = $scope.view.name;

            Cliche.manageProperty(options.mode, formatted, options.properties, idObj)
                .then(function() {

                    var prePopulateInputs = options.mode === 'add' && options.toolType === 'tool' && options.inputs && !_.isArray(options.inputs);

                    if (prePopulateInputs) {
                        options.inputs[$scope.view.name] = Helper.getDefaultInputValue(
                            $scope.view.name,
                            $scope.view.symbols,
                            $scope.view.type,
                            ($scope.view.items ? $scope.view.items.type : null)
                        );
                    }

                    $modalInstance.close({prop: formatted});
                }, function(error) {
                    $scope.view.error = error;
                });


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

                    if (options.mode === 'edit') { options.inputs[$scope.view.name] = []; }

                    if (_.isUndefined($scope.view.items.fields)) {

                        $scope.view.items.fields = [];

                        if ($scope.view.adapter) {
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
