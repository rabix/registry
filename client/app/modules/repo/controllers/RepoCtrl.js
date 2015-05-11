'use strict';

angular.module('registryApp.repo')
    .controller('RepoCtrl', ['$scope', '$stateParams', '$q', '$modal', '$templateCache', 'Repo', 'Build', 'Job', 'User', 'Sidebar', 'Loading', function ($scope, $stateParams, $q, $modal, $templateCache, Repo, Build, Job, User, Sidebar, Loading) {

        Sidebar.setActive('repos');

        $scope.view = {};
        $scope.view.page = {
            tools: 1,
            scripts: 1,
            workflows: 1,
            tasks: 1,
            builds: 1
        };
        $scope.view.total = {
            tools: 1,
            scripts: 1,
            workflows: 1,
            tasks: 1,
            builds: 1
        };

        $scope.view.loading = true;
        $scope.view.tab = 'tools';
        $scope.view.repo = null;

        $scope.view.tools = [];
        $scope.view.scripts = [];
        $scope.view.workflows = [];
        $scope.view.tasks = [];
        $scope.view.builds = [];

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

        Repo.getRepo($stateParams.id).then(function (result) {

            $scope.view.repo = result.repo;

            $q.all([
                Repo.repoTools(0, $stateParams.id),
                Repo.repoScripts(0, $stateParams.id),
                Repo.repoWorkflows(0, $stateParams.id),
                Repo.repoTasks(0, $stateParams.id),
                Build.getBuilds(0, $stateParams.id)
            ]).then(function (result) {

                $scope.view.loading = false;

                $scope.view.tools = itemsLoaded(result[0], 'tools');
                $scope.view.scripts = itemsLoaded(result[1], 'scripts');
                $scope.view.workflows = itemsLoaded(result[2], 'workflows');
                $scope.view.tasks = itemsLoaded(result[3], 'tasks');
                $scope.view.builds = itemsLoaded(result[4], 'builds');
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
        };

        /**
         * Load more tools by offset
         *
         * @param offset
         */
        $scope.getMoreTools = function(offset) {

            $scope.view.loading = true;

            Repo.repoTools(offset, $stateParams.id).then(function (result) {
                $scope.view.tools = itemsLoaded(result, 'tools');
            });

        };

        /**
         * Load more scripts by offset
         *
         * @param offset
         */
        $scope.getMoreScripts = function(offset) {

            $scope.view.loading = true;

            Repo.repoScripts(offset, $stateParams.id).then(function (result) {
                $scope.view.scripts = itemsLoaded(result, 'scripts');
            });

        };

        /**
         * Load more workflows by offset
         *
         * @param offset
         */
        $scope.getMoreWorkflows = function(offset) {

            $scope.view.loading = true;

            Repo.repoWorkflows(offset, $stateParams.id).then(function (result) {
                $scope.view.workflows = itemsLoaded(result, 'workflows');
            });

        };

        /**
         * Load more tasks by offset
         *
         * @param offset
         */
        $scope.getMoreTasks = function(offset) {

            $scope.view.loading = true;

            Repo.repoTasks(offset, $stateParams.id).then(function (result) {
                $scope.view.tasks = itemsLoaded(result, 'tasks');
            });

        };

        /**
         * Load more builds by offset
         *
         * @param offset
         */
        $scope.getMoreBuilds = function(offset) {

            $scope.view.loading = true;

            Build.getBuilds(offset, $stateParams.id).then(function (result) {
                $scope.view.builds = itemsLoaded(result, 'builds');
            });

        };

        /**
         * Manage repo name
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
