'use strict';

angular.module('registryApp.dyole')
    .controller('NodeEditCtrl', ['$scope', '$modalInstance', 'data', '$timeout', function ($scope, $modalInstance, data, $timeout) {


        $scope.data = data;
        $scope.view = {
            error: null,
            name: data.name
        };

        $timeout(function() {
            angular.element('.node-label-edit').trigger('focus');
        },1);

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
