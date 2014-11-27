'use strict';

angular.module('registryApp')
    .controller('ModalJSONCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.data = data;
        $scope.view = {};

        $scope.view.saving = false;
        $scope.view.json = data.json;

        $scope.copy = function () {
            console.log('copy');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.getUrl = function () {
            $modalInstance.close($scope.view.json);
        };

    }]);
