/**
 * Created by filip on 11/5/14.
 */
'use strict';

angular.module('registryApp.repo')
    .controller('PickRepoModalCtrl', ['$scope', '$modalInstance', 'data', 'HotkeyRegistry', function ($scope, $modalInstance, data, HotkeyRegistry) {

        $scope.view = {};
        $scope.view.repos = data.repos;
        $scope.view.type = data.type;
        $scope.view.pickName = data.pickName || false;

        /**
         * Close the modal and send data to be saved
         */
        $scope.ok = function () {

            if ($scope.view.pickName && $scope.view.form.name.$invalid) {
                return false;
            }

            if ($scope.view.form.repo.$invalid) {
                return false;
            }

            $modalInstance.close({repoId: $scope.view.repoSelected, name: $scope.view.name});
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        var unloadHotkeys = HotkeyRegistry.loadHotkeys({name: 'confirm', callback: $scope.ok, preventDefault: true, allowIn: ['SELECT']});

        $scope.$on('$destroy', function () {
            unloadHotkeys();
        });

    }]);
