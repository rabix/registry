'use strict';

angular.module('registryApp')
    .controller('ReposCtrl', ['$scope', '$window', 'Repo', 'Header', 'Loading', 'User', function ($scope, $window, Repo, Header, Loading, User) {

        Header.setActive('repos');

        /**
         * Callback when repos are loaded
         *
         * @param result
         */
        var reposLoaded = function(result) {

            $scope.view.paginator.prev = $scope.view.page > 1;
            $scope.view.paginator.next = ($scope.view.page * $scope.view.perPage) < result.total;
            $scope.view.total = Math.ceil(result.total / $scope.view.perPage);

            $scope.view.repos = result.list;
            $scope.view.loading = false;

        };

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.repos = [];
        $scope.view.searchTerm = '';
        $scope.view.user = {};

        User.getUser().then(function(result) {
            $scope.view.user = result.user;
        });

        $scope.view.paginator = {
            prev: false,
            next: false
        };

        $scope.view.page = 1;
        $scope.view.perPage = 25;
        $scope.view.total = 0;

        $scope.view.classes = ['page', 'repos'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Repo.getRepos(0).then(reposLoaded);

        /**
         * Go to the next/prev page
         *
         * @param dir
         */
        $scope.goToPage = function(dir) {

            if (!$scope.view.loading) {

                if (dir === 'prev') {
                    $scope.view.page -= 1;
                }
                if (dir === 'next') {
                    $scope.view.page += 1;
                }

                $scope.view.loading = true;
                var offset = ($scope.view.page - 1) * $scope.view.perPage;

                Repo.getRepos(offset).then(reposLoaded);

            }
        };

        /**
         * Search repos by the term
         */
        $scope.searchRepos = function() {

            $scope.view.page = 1;
            Repo.getRepos(0, $scope.view.searchTerm).then(reposLoaded);

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            Repo.getRepos(0).then(reposLoaded);

        };


    }]);
