'use strict';

angular.module('registryApp.app')
    .controller('ToolRevisionCtrl', ['$scope', '$routeParams', '$q', '$location', 'Tool', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $location, Tool, Sidebar, Loading) {

        Sidebar.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;

        $scope.view.revision = null;
        $scope.view.repo = null;
        $scope.view.author = null;

        $scope.view.isJsonVisible = false;

        $scope.view.domain = $location.protocol() + '://' + $location.host() + ($location.port() ? ':' + $location.port() : '');

        $scope.view.classes = ['page', 'revision'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Tool.getRevision($routeParams.id)
            .then(
                function(result) {
                    $scope.view.revision = result.data;
                    $scope.view.repo = result.app.repo;
                    $scope.view.author = result.app.user;
                    $scope.view.app = result.app;

                    $scope.view.loading = false;
                });

        /**
         * Toggle json visibility
         */
        $scope.toggleJson = function() {
            $scope.view.isJsonVisible = !$scope.view.isJsonVisible;
        };


    }]);
