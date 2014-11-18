'use strict';

angular.module('registryApp')
    .controller('RevisionCtrl', ['$scope', '$routeParams', '$q', 'App', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, App, Sidebar, Loading) {

        Sidebar.setActive('tools');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.revision = null;
        $scope.view.repo = null;
        $scope.view.author = null;
        $scope.view.isJsonVisible = false;

        $scope.view.classes = ['page', 'revision'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        App.getRevision($routeParams.id)
            .then(
                function(result) {
                    $scope.view.revision = result.data;
                    $scope.view.repo = result.repo;
                    $scope.view.author = result.user;
                    $scope.view.loading = false;
                });

        $scope.toggleJson = function() {
            $scope.view.isJsonVisible = !$scope.view.isJsonVisible;
        };


    }]);
