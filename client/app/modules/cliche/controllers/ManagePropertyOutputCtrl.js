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
        $scope.view.property = options.property || {};
        $scope.view.property.schema = Cliche.getSchema('output', options.property, options.toolType, false);

        // only add adapter if one has been defined
        if (options.property && options.property.adapter) {
            $scope.view.property.adapter = Cliche.getAdapter(options.property);
        }

        $scope.view.name = Cliche.parseName(options.property);
        $scope.view.required = Cliche.isRequired($scope.view.property.schema);
        $scope.view.type = Cliche.parseType($scope.view.property.schema);
        $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.property.schema);

        $scope.view.types = Cliche.getTypes('output');
        $scope.view.itemTypes = Cliche.getTypes('outputItem');

        idObj.o = $scope.view.name;

        // shows expression style input rather than regular input
        // for secondary files (not currently using)
        $scope.view.isSecondaryFilesExpr = false;

        // create list of input ids to inherit metadata from (not currently using)
        //$scope.view.inputs = _.pluck(_.filter(Cliche.getTool().inputs, function(prop) {
        //    var type = Cliche.parseType(prop.schema),
        //        typeObj = Cliche.parseTypeObj(prop.schema);
        //    return type === 'file' || (typeObj.items && typeObj.items.type === 'file');
        //}), '@id');

        /**
         * Toggle secondary files into array (not currently using)
         */
        //$scope.toggleToList = function() {
        //    $scope.view.property.adapter.secondaryFiles = [];
        //    $scope.view.property.adapter.secondaryFiles.push('');
        //    $scope.view.isSecondaryFilesExpr = false;
        //};

        $scope.view.newMeta = {key: '', value: ''};

        /**
         * Add meta data to the output
         */
        $scope.addMeta = function () {

            $scope.view.newMeta.error = false;
            $scope.view.property.adapter = $scope.view.property.adapter || {};

            if (!$scope.view.property.adapter.metadata) {
                $scope.view.property.adapter.metadata = {};
            }

            if (!_.isUndefined($scope.view.property.adapter.metadata[$scope.view.newMeta.key]) || $scope.view.newMeta.key === '') {
                $scope.view.newMeta.error = true;
                return false;
            }

            $scope.view.property.adapter.metadata[$scope.view.newMeta.key] = $scope.view.newMeta.value;
            $scope.view.newMeta = {key: '', value: ''};

        };

        /**
         * Remove meta data from the output
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeMeta = function (index) {
            delete $scope.view.property.adapter.metadata[index];
        };

        /**
         * Update new meta value with expression or literal
         *
         * @param value
         */

        $scope.updateNewMeta = function (value) {
            $scope.view.newMeta.value = value;
        };

        /**
         * Update existing meta value with expression or literal
         *
         * @param index
         * @param value
         */
        $scope.updateMetaValue = function (index, value) {
            $scope.view.property.adapter.metadata[index] = value;
        };

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

            var formatted = Cliche.formatProperty(inner, $scope.view.property, 'output');

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

            if (_.isUndefined($scope.view.property.adapter)) {
                $scope.view.property.adapter = {};
            }
            $scope.view.property.adapter.glob = value;
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
