'use strict';

angular.module('registryApp')
    .controller('RepoInstructionsCtrl', ['$scope', '$routeParams', 'Repo', 'Sidebar', 'Loading', function ($scope, $routeParams, Repo, Sidebar, Loading) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.repo = null;

        $scope.view.classes = ['page', 'repo-instructions'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Repo.getRepo($routeParams.id).then(function (result) {

            $scope.view.repo = result.data;
            $scope.view.loading = false;

        });


    }]);
