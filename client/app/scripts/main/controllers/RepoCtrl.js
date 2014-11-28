'use strict';

angular.module('registryApp')
    .controller('RepoCtrl', ['$scope', '$routeParams', '$q', '$modal', '$templateCache', 'Repo', 'App', 'Build', 'User', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $modal, $templateCache, Repo, App, Build, User, Sidebar, Loading) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.page = {
            apps: 1,
            workflows: 1,
            builds: 1
        };
        $scope.view.total = {
            apps: 1,
            workflows: 1,
            builds: 1
        };
        $scope.view.loading = true;
        $scope.view.tab = 'apps';
        $scope.view.repo = null;
        $scope.view.apps = [];
        $scope.view.workflows = [];
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
                Repo.repoTools(0, $routeParams.id),
                Repo.repoWorkflows(0, $routeParams.id),
                Build.getBuilds(0, $routeParams.id)
            ]).then(function (result) {

                $scope.view.loading = false;

                $scope.view.apps = itemsLoaded(result[0], 'apps');
                $scope.view.workflows = itemsLoaded(result[1], 'workflows');
                $scope.view.builds = itemsLoaded(result[2], 'builds');
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

        /**
         * Load more apps by offset
         *
         * @param offset
         */
        $scope.getMoreApps = function(offset) {

            $scope.view.loading = true;

            Repo.repoTools(offset, $routeParams.id).then(function (result) {
                $scope.view.apps = itemsLoaded(result, 'apps');
            });

        };

        /**
         * Load more workflows by offset
         *
         * @param offset
         */
        $scope.getMoreWorkflows = function(offset) {

            $scope.view.loading = true;

            Repo.repoWorkflows(offset, $routeParams.id).then(function (result) {
                $scope.view.workflows = itemsLoaded(result, 'workflows');
            });

        };

        /**
         * Load more builds by offset
         *
         * @param offset
         */
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

            $modal.open({
                template: $templateCache.get('views/partials/manage-repo.html'),
                controller: 'ManageRepoCtrl',
                windowClass: 'modal-add-repo',
                resolve: {data: function () { return {repo: $scope.view.repo}; }}
            });

        };

        /**
         * Publish the repo
         */
        $scope.publish = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-action.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {message: 'Are you sure you want to publish this repo?'}; }}
            });

            modalInstance.result
                .then(function() {

                    $scope.view.saving = true;

                    Repo.publishRepo($scope.view.repo._id)
                        .then(function() {
                            $scope.view.repo.is_public = true;
                            $scope.view.saving = false;
                        });
                });

        };


    }]);
