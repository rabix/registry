/**
 * Created by filip on 11/5/14.
 */
'use strict';

angular.module('registryApp')
    .controller('PickRepoModalCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.repos = data.repos;
        $scope.view.type = data.type;
        $scope.view.pickName = data.pickName || false;

        $scope.ok = function () {

            if ($scope.view.pickName && $scope.view.form.$invalid) {
                return false;
            }

            $modalInstance.close({repoId: $scope.view.repoSelected, name: $scope.view.name});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
