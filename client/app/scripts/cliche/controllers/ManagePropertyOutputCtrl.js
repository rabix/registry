/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyOutputCtrl', ['$scope', '$modalInstance', 'Cliche', 'options', function ($scope, $modalInstance, Cliche, options) {

        var key = options.key || 'name';
        var idObj = {n: '', o: ''};

        $scope.view = {};
        $scope.view.key = key;
        $scope.view.mode = options.mode;
        $scope.view.property = Cliche.getSchema('output', options.property, options.toolType);
        $scope.view.name = Cliche.parseName(key, options.property);
        $scope.view.required = Cliche.isRequired($scope.view.property.type);
        $scope.view.type = Cliche.parseType($scope.view.property.type);
        $scope.view.items = Cliche.getItemsRef(key, $scope.view.type, $scope.view.property);

        $scope.view.types = Cliche.getTypes('output');
        $scope.view.itemTypes = Cliche.getTypes('outputItem');

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
                items: $scope.view.items
            };

            var formatted = Cliche.formatProperty(inner, $scope.view.property);

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
                    $scope.view.items.type = 'file';
                } else {
                    delete $scope.view.items;
                }
            }
        });


        /**
         * Update existing glob value with expression or literal
         *
         * @param value
         */
        $scope.updateGlobValue = function (value) {
            $scope.view.property.adapter.glob = value;
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
