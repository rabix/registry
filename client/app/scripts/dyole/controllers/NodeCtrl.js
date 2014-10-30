/**
 * Author: Milica Kadic
 * Date: 10/30/14
 * Time: 1:35 PM
 */

'use strict';

angular.module('registryApp.dyole')
    .controller('NodeCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.data = data;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
