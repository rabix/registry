'use strict';

angular.module('registryApp.repo')
    .controller('ManageRepoCtrl', ['$scope', '$modalInstance', 'data', 'Repo', function ($scope, $modalInstance, data, Repo) {

        $scope.view = {};
        $scope.view.action = data.repo ? 'update' : 'add';
        $scope.view.repo = data.repo || {};
        $scope.view.id = data.repo ? data.repo._id : null;

        /**
         * Close the modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        /**
         * Save the repo data
         *
         * @returns {boolean}
         */
        $scope.save = function() {

            if ($scope.view.form.$invalid) {
                $scope.view.form.$setDirty();
                return false;
            }

            var data = {
                name: $scope.view.repo.name,
                description: $scope.view.repo.description
            };

            Repo.manageRepo($scope.view.id, $scope.view.action, data)
                .then(function() {
                    $modalInstance.close();
                });

        };

    }]);
