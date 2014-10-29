'use strict';

angular.module('registryApp')
    .controller('AppsCtrl', ['$scope', '$routeParams', 'App', 'Sidebar', 'Api', 'Loading', 'User',function ($scope, $routeParams, App, Sidebar, Api, Loading, User) {

        Sidebar.setActive('apps');

        /**
         * Callback when apps are loaded
         *
         * @param result
         */
        var appsLoaded = function(result) {

            $scope.view.paginator.prev = $scope.view.page > 1;
            $scope.view.paginator.next = ($scope.view.page * $scope.view.perPage) < result.total;
            $scope.view.total = Math.ceil(result.total / $scope.view.perPage);

            $scope.view.apps = result.list;
            $scope.view.loading = false;
        };

        User.getUser().then(function (result) {
            $scope.view.user = result.user;
        });

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.apps = [];
        $scope.view.searchTerm = '';
        if ($routeParams.repo) {
            $scope.view.repo = $routeParams.repo.replace(/&/g, '/');
        }

        $scope.view.classes = ['page', 'apps'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $scope.view.paginator = {
            prev: false,
            next: false
        };

        $scope.view.page = 1;
        $scope.view.perPage = 25;
        $scope.view.total = 0;

        App.getApps(0, '', $routeParams.repo).then(appsLoaded);

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

                App.getApps(offset, $scope.view.searchTerm, $routeParams.repo, $scope.view.mine).then(appsLoaded);

            }
        };

        /**
         * Search apps by the term
         */
        $scope.searchApps = function() {

            $scope.view.page = 1;
            $scope.view.loading = true;

            App.getApps(0, $scope.view.searchTerm, $routeParams.repo, $scope.view.mine).then(appsLoaded);

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            App.getApps(0, '', $routeParams.repo, $scope.view.mine).then(appsLoaded);

        };

        /**
         * Toggle query for myApps filter
         */
        $scope.toggleMyApps = function () {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            App.getApps(0, '', $routeParams.repo, $scope.view.mine).then(appsLoaded);
        };

    }]);
