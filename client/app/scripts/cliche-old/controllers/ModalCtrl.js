/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ModalCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.data = data;

        /**
         * Close modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
