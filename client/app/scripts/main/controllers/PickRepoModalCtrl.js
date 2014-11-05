/**
 * Created by filip on 11/5/14.
 */
'use strict';

angular.module('registryApp')
    .controller('PickRepoModalCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.repos = data.repos;
        $scope.view.type = data.type;

        $scope.ok = function () {
            $modalInstance.close($scope.view.repoSelected);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
