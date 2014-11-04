'use strict';

angular.module('registryApp')
    .controller('ManageRepoCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.repo = data.repo || {};

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.save = function() {

            if ($scope.view.form.$invalid) {
                $scope.view.form.$setDirty();
                return false;
            }

        };

    }]);
