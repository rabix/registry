/**
 * Author: Milica Kadic
 * Date: 11/26/14
 * Time: 1:40 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('InputFileMoreCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.schema = angular.copy(data.schema);
        $scope.view.key = data.key;

        $scope.view.newMeta = {key: '', value: ''};

        if (_.isUndefined($scope.view.schema.secondaryFiles)) {
            $scope.view.schema.secondaryFiles = [];
        }

        /**
         * Do the schema update
         *
         * @returns {boolean}
         */
        $scope.update = function() {

            $scope.view.error = '';

            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            $modalInstance.close($scope.view.schema);

        };

        /**
         * Add meta data to the input
         */
        $scope.addMeta = function () {

            $scope.view.newMeta.error = false;

            if (!$scope.view.schema.metadata) {
                $scope.view.schema.metadata = {};
            }

            if (!_.isUndefined($scope.view.schema.metadata[$scope.view.newMeta.key]) || $scope.view.newMeta.key === '') {
                $scope.view.newMeta.error = true;
                return false;
            }

            $scope.view.schema.metadata[$scope.view.newMeta.key] = $scope.view.newMeta.value;
            $scope.view.newMeta = {key: '', value: ''};

        };

        /**
         * Remove meta data from the input
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeMeta = function (index) {
            delete $scope.view.schema.metadata[index];
        };

        /**
         * Close the modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


    }]);
