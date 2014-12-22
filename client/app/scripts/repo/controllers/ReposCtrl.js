'use strict';

angular.module('registryApp.repo')
    .controller('ReposCtrl', ['$scope', '$q', '$injector', 'Repo', 'Sidebar', 'Loading', 'User', function ($scope, $q, $injector, Repo, Sidebar, Loading, User) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 0;
        $scope.view.loading = true;
        $scope.view.repos = [];
        $scope.view.searchTerm = '';
        $scope.view.user = {};

        $scope.view.classes = ['page', 'repos'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /**
         * Callback when repos are loaded
         *
         * @param result
         */
        var reposLoaded = function(result) {

            $scope.view.repos = result.list;
            $scope.view.total = result.total;
            $scope.view.loading = false;
        };

        $q.all([
                Repo.getRepos(0),
                User.getUser()
            ]).then(function(result) {
                reposLoaded(result[0]);
                $scope.view.user = result[1].user;
            });

        /**
         * Get more repos by offset
         *
         * @param offset
         */
        $scope.getMoreRepos = function(offset) {

            $scope.view.loading = true;

            Repo.getRepos(offset).then(reposLoaded);

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

        /**
         * Manage repo name
         *
         * @param {Object} repo
         */
        $scope.manageRepoModal = function(repo) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/manage-repo.html'),
                controller: 'ManageRepoCtrl',
                windowClass: 'modal-add-repo',
                resolve: {data: function () { return {repo: repo}; }}
            });

            modalInstance.result.then(function() {
                $scope.resetSearch();
            });

        };


    }]);
