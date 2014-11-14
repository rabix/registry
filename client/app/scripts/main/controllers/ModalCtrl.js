'use strict';

angular.module('registryApp')
    .controller('ModalCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.data = data;
        $scope.view = {};
        
        $scope.view.message = data.message ? data.message : "Are you sure you want to delete this item?";

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
