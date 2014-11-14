'use strict';

angular.module('registryApp')
    .controller('RepoCtrl', ['$scope', '$routeParams', '$q', '$injector', 'Repo', 'App', 'Build', 'User', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $injector, Repo, App, Build, User, Sidebar, Loading) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.page = {
            apps: 1,
            builds: 1
        };
        $scope.view.total = {
            apps: 1,
            builds: 1
        };
        $scope.view.loading = true;
        $scope.view.tab = 'apps';
        $scope.view.repo = null;
        $scope.view.apps = [];
        $scope.view.builds = [];
        $scope.view.resize = false;
        $scope.view.user = {};

        $scope.view.classes = ['page', 'repo'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        User.getUser().then(function(result) {
            $scope.view.user = result.user;
        });

        Repo.getRepo($routeParams.id).then(function (result) {

            $scope.view.repo = result.data;

            $q.all([
                App.getApps(0, '', false, $routeParams.id),
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

            $scope.view.total[tab] = result.total;
            $scope.view.loading = false;

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

        $scope.getMoreApps = function(offset) {

            $scope.view.loading = true;

            App.getApps(offset, '', false, $routeParams.id).then(function (result) {
                $scope.view.apps = itemsLoaded(result, 'apps');
            });

        };

        $scope.getMoreBuilds = function(offset) {

            $scope.view.loading = true;

            Build.getBuilds(offset, $routeParams.id).then(function (result) {
                $scope.view.builds = itemsLoaded(result, 'builds');
            });

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
