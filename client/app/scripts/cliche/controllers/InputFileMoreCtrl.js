/**
 * Author: Milica Kadic
 * Date: 11/26/14
 * Time: 1:40 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('InputFileMoreCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.scheme = angular.copy(data.scheme);
        $scope.view.key = data.key;

        $scope.view.newMeta = {key: '', value: ''};

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

            $modalInstance.close($scope.view.scheme);

        };

        /**
         * Add meta data to the input
         */
        $scope.addMeta = function () {

            $scope.view.newMeta.error = false;

            if (!$scope.view.scheme.metadata) {
                $scope.view.scheme.metadata = {};
            }

            if (!_.isUndefined($scope.view.scheme.metadata[$scope.view.newMeta.key]) || $scope.view.newMeta.key === '') {
                $scope.view.newMeta.error = true;
                return false;
            }

            $scope.view.scheme.metadata[$scope.view.newMeta.key] = $scope.view.newMeta.value;
            $scope.view.newMeta = {key: '', value: ''};

        };

        /**
         * Remove meta data from the input
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeMeta = function (index) {
            delete $scope.view.scheme.metadata[index];
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
