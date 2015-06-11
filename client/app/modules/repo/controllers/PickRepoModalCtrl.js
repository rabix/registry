/**
 * Created by filip on 11/5/14.
 */
'use strict';

angular.module('registryApp.repo')
    .controller('PickRepoModalCtrl', ['$scope', '$modalInstance', 'data', 'HotkeyRegistry', 'Repo', function ($scope, $modalInstance, data, HotkeyRegistry, Repo) {

        $scope.view = {};
        $scope.view.repos = data.repos;
        $scope.view.type = data.type;
        $scope.view.pickName = data.pickName || false;
        $scope.view.id = data.repo ? data.repo._id : null;
        $scope.view.action = 'add';
        $scope.view.repo = {};
        $scope.view.repoCreationVisible = false;
        /**
         * Close the modal and send data to be saved
         */
        $scope.ok = function () {

            if (_.isUndefined($scope.view.repoSelected)){

              if (_.isUndefined($scope.view.repo.name)) {
                return false;
              }
              var data = {
                name: $scope.view.repo.name,
                description: $scope.view.repo.description
              };
              Repo.validateRepoName($scope.view.repo.name).then(function (result) {
                if (result['message'] === 'Repo name available') {
                  Repo.manageRepo($scope.view.id, $scope.view.action, data)
                    .then(function (result) {
                      $modalInstance.close({repoId: result.repo._id, name: result.repo.name});
                    });
                }
              });


            }
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

        $scope.showRepoCreation = function(){
          $scope.view.repoCreationVisible = true;

        }

    }]);
