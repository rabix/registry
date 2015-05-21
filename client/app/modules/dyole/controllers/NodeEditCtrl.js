'use strict';

angular.module('registryApp.dyole')
    .controller('NodeEditCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.data = data;
        $scope.view = {
            error: null,
            name: data.name
        };

        $scope.ok = function () {
            var test = data.onEdit($scope.name);

            if ($scope.form.$invalid) {
                return false;
            }


            if (test) {
                data.onSave.call(data.scope, $scope.view.name);
                $modalInstance.close();
            } else {
                $scope.view.error = 'Name must be uniqe.';
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
