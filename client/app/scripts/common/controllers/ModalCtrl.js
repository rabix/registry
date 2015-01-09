'use strict';

angular.module('registryApp.common')
    .controller('ModalCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.data = data;
        $scope.view = {};

        $scope.view.message = data.message ? data.message : "Are you sure you want to delete this item?";

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
