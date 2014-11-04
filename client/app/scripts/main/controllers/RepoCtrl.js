'use strict';

angular.module('registryApp')
    .controller('RepoCtrl', ['$scope', '$routeParams', '$q', '$injector', 'Repo', 'App', 'Build', 'User', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $injector, Repo, App, Build, User, Sidebar, Loading) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.tab = 'apps';
        $scope.view.repo = null;
        $scope.view.apps = [];
        $scope.view.builds = [];
        $scope.view.resize = false;

        $scope.view.paginator = {
            apps: {
                prev: false,
                next: false,
                page: 1,
                total: 0,
                perPage: 25,
                loading: false
            },
            builds: {
                prev: false,
                next: false,
                page: 1,
                total: 0,
                perPage: 25,
                loading: false
            }
        };

        $scope.view.user = {};

        User.getUser().then(function(result) {
            $scope.view.user = result.user;
        });

        $scope.view.classes = ['page', 'repo'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Repo.getRepo($routeParams.id).then(function (result) {

            console.log(result);
            $scope.view.repo = result.data;

            $q.all([
                App.getApps(0, '', $routeParams.id),
                Build.getBuilds(0, $routeParams.id)
            ]).then(function (result) {

                $scope.view.loading = false;

                $scope.view.apps = itemsLoaded(result[0], 'apps');
                $scope.view.builds = itemsLoaded(result[1], 'builds');
            });

        });

        /**
         * Callback when items are loaded
         *
         * @param result
         */
        var itemsLoaded = function (result, tab) {

            $scope.view.paginator[tab].prev = $scope.view.paginator[tab].page > 1;
            $scope.view.paginator[tab].next = ($scope.view.paginator[tab].page * $scope.view.paginator[tab].perPage) < result.total;
            $scope.view.paginator[tab].total = Math.ceil(result.total / $scope.view.paginator[tab].perPage);

            return result.list;

        };

        /**
         * Switch the tab
         * @param tab
         */
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;
            $scope.view.resize = true;
        };

        /**
         * Go to the next/prev page
         *
         * @param dir
         */
        $scope.goToPage = function(dir) {

            if (!$scope.view.paginator[$scope.view.tab].loading) {

                if (dir === 'prev') {
                    $scope.view.paginator[$scope.view.tab].page -= 1;
                }
                if (dir === 'next') {
                    $scope.view.paginator[$scope.view.tab].page += 1;
                }

                $scope.view.paginator[$scope.view.tab].loading = true;
                var offset = ($scope.view.paginator[$scope.view.tab].page - 1) * $scope.view.paginator[$scope.view.tab].perPage;

                if ($scope.view.tab === 'apps') {
                    App.getApps(offset, '', $routeParams.id).then(function (result) {
                        $scope.view.apps = itemsLoaded(result, 'apps');
                        $scope.view.paginator.apps.loading = false;
                    });
                }

                if ($scope.view.tab === 'builds') {
                    Build.getBuilds(offset, $routeParams.id).then(function (result) {
                        $scope.view.builds = itemsLoaded(result, 'builds');
                        $scope.view.paginator.builds.loading = false;
                    });
                }
            }
        };

        /**
         * Manage repo name
         *
         * @param {Object} repo
         */
        $scope.manageRepoModal = function() {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            $modal.open({
                template: $templateCache.get('views/partials/manage-repo.html'),
                controller: 'ManageRepoCtrl',
                windowClass: 'modal-add-repo',
                resolve: {data: function () { return {repo: $scope.view.repo}; }}
            });

        };


    }]);
