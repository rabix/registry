/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyOutputCtrl', ['$scope', '$modalInstance', 'Data', 'options', function ($scope, $modalInstance, Data, options) {

        $scope.view = {};
        $scope.view.property = angular.copy(options.property);
        $scope.view.name = options.name;
        $scope.view.required = options.required;
        $scope.view.mode = _.isUndefined($scope.view.property) ? 'add' : 'edit';

        if (_.isUndefined($scope.view.property)) {
            $scope.view.property = {
                type: 'file',
                adapter: {metadata: {}}
            };
        }

        $scope.view.disabled = ($scope.view.property.items && $scope.view.property.items.type) === 'object';
        $scope.view.newMeta = {key: '', value: ''};

        $scope.view.inputs = [];
        _.each(Data.tool.inputs.properties, function (value, key) {
            if (value.type === 'file' || (value.items && value.items.type === 'file')) {
                $scope.view.inputs.push(key);
            }
        });

        if (_.isUndefined($scope.view.property.adapter)) {
            $scope.view.property.adapter = {};
        }

        if (_.isArray($scope.view.property.adapter.secondaryFiles) && $scope.view.property.adapter.secondaryFiles.length === 0) {
            delete $scope.view.property.adapter.secondaryFiles;
            $scope.view.isSecondaryFilesExpr = true;
        } else if (!_.isArray($scope.view.property.adapter.secondaryFiles)) {
            $scope.view.isSecondaryFilesExpr = true;
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

            if ($scope.view.mode === 'edit') {
                $modalInstance.close({prop: $scope.view.property, required: $scope.view.required});
            } else {
                Data.addProperty('output', $scope.view.name, $scope.view.property, options.properties)
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
                Data.transformProperty($scope.view.property, 'output', n);
            }
        });

        /* watch for inherit property change */
        $scope.$watch('view.property.adapter.metadata.__inherit__', function(n, o) {
            if (n !== o) {
                if (_.isEmpty(n)) {
                    delete $scope.view.property.adapter.metadata.__inherit__;
                }
            }
        });

        $scope.$watch('view.property.adapter.secondaryFiles.length', function(n, o) {
            if (n !== o && n === 0) {
                delete $scope.view.property.adapter.secondaryFiles;
                $scope.view.isSecondaryFilesExpr = true;
            }
        });

        /**
         * Toggle secondary files into array
         */
        $scope.toggleToList = function() {
            $scope.view.property.adapter.secondaryFiles = [];
            $scope.view.property.adapter.secondaryFiles.push('');
            $scope.view.isSecondaryFilesExpr = false;
        };

        /**
         * Update secondary files value
         *
         * @param value
         */
        $scope.updateSecondaryFilesValue = function(value) {
            $scope.view.property.adapter.secondaryFiles = value;
        };

        /**
         * Update transform value with expression
         *
         * @param value
         */
        $scope.updateTransform = function (value, key) {
            $scope.view.property.adapter[key] = value;
        };

        /**
         * Add meta data to the output
         */
        $scope.addMeta = function () {

            $scope.view.newMeta.error = false;

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
         * @param value
         */
        $scope.updateMetaValue = function (index, value) {
            $scope.view.property.adapter.metadata[index] = value;
        };

        /**
         * Update existing glob value with expression or literal
         *
         * @param value
         */
        $scope.updateGlobValue = function (value) {
            $scope.view.property.adapter.glob = value;
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
