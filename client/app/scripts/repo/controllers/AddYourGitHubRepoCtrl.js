'use strict';

angular.module('registryApp.repo')
    .controller('AddYourGitHubRepoCtrl', ['$scope', '$timeout', '$location', '$filter', 'Repo', 'Sidebar', 'Loading', function ($scope, $timeout, $location, $filter, Repo, Sidebar, Loading) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.repos = [];

        $scope.view.classes = ['page', 'add-your-github-repo'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Repo.getGitHubRepos().then(function(result) {
            $scope.view.loading = false;
            $scope.view.repos = result.list;
        });

        /**
         * Add repo to the user
         * @param repo
         */
        $scope.addRepo = function (repo) {

            repo.adding = true;

            Repo.addGitHubRepo(repo).then(function(result) {
                repo.adding = false;
                $location.path('/repo-instructions/' + result.repo._id);

            });

        };


    }]);
