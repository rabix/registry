/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyInputCtrl', ['$scope', '$modalInstance', 'Cliche', 'options', function ($scope, $modalInstance, Cliche, options) {

        var key = options.key || 'name';
        var idObj = {n: '', o: ''};
        var cacheAdapter = {};

        $scope.view = {};
        $scope.view.key = key;
        $scope.view.mode = options.mode;
        $scope.view.property = options.property || {};
        $scope.view.property.schema =  Cliche.getSchema('input', options.property, options.toolType, false);

        // only add adapter if one has been defined
        if (options.property && options.property.adapter) {
            $scope.view.property.adapter = Cliche.getAdapter(options.property);
        }

        $scope.view.name = Cliche.parseName(options.property);
        $scope.view.required = Cliche.isRequired($scope.view.property.schema);
        $scope.view.type = Cliche.parseType($scope.view.property.schema);
        $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.property.schema);

        $scope.view.types = Cliche.getTypes('input');
        $scope.view.itemTypes = Cliche.getTypes('inputItem');

        var enumObj = Cliche.parseEnum($scope.view.property.schema);

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

            /* special case, if enum type we need to check if enum name already exists */
            if ($scope.view.type === 'enum') {

                enumObj.newName = $scope.view.enumName;

                if (Cliche.checkIfEnumNameExists(options.mode, enumObj)) {
                    $scope.view.error = 'Choose another enum name, "' + $scope.view.enumName + '" already exists';
                    return false;
                }
            }

            var inner = {
                key: key,
                name: $scope.view.name,
                required: $scope.view.required,
                type: $scope.view.type,
                enumName: $scope.view.enumName,
                symbols: $scope.view.symbols,
                items: $scope.view.items
            };

            var formatted = Cliche.formatProperty(inner, $scope.view.property, 'input');

            idObj.n = $scope.view.name;

            Cliche.manageProperty(options.mode, formatted, options.properties, idObj)
                .then(function() {
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
