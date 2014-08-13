'use strict';

angular.module('registryApp')
    .controller('RepoInstructionsCtrl', ['$scope', '$routeParams', 'Repo', 'Header', 'Loading', function ($scope, $routeParams, Repo, Header, Loading) {

        Header.setActive('repos');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.repo = null;

        $scope.view.classes = ['page', 'repo-instructions'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        var repoId = $routeParams.id.replace(/&/g, '/');

        Repo.getRepo(repoId).then(function (repo) {

            $scope.view.repo = Repo.parseUser(repo);
            $scope.view.loading = false;

        });


    }]);
