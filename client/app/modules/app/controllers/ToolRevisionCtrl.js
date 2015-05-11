'use strict';

angular.module('registryApp.app')
    .controller('ToolRevisionCtrl', ['$scope', '$stateParams', '$q', 'Tool', 'Sidebar', 'Loading', 'Helper', function ($scope, $stateParams, $q, Tool, Sidebar, Loading, Helper) {

        Sidebar.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;

        $scope.view.revision = null;
        $scope.view.repo = null;
        $scope.view.author = null;

        $scope.view.isJsonVisible = false;

        $scope.view.domain = Helper.getDomain();

        $scope.view.classes = ['page', 'revision'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Tool.getRevision($stateParams.id)
            .then(
                function(result) {
                    $scope.view.revision = result.data;
                    $scope.view.repo = result.app.repo;
                    $scope.view.author = result.app.user;
                    $scope.view.app = result.app;

                    $scope.view.docker = _.find($scope.view.revision.json.requirements, {'@type': 'DockerCnt'});

                    $scope.view.loading = false;
                });

        /**
         * Toggle json visibility
         */
        $scope.toggleJson = function() {
            $scope.view.isJsonVisible = !$scope.view.isJsonVisible;
        };


    }]);
