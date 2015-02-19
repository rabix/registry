'use strict';

angular.module('registryApp.app')
    .controller('AppsCtrl', ['$scope', '$q', 'Tool', 'Workflow', 'Sidebar', 'Api', 'Loading', 'User',function ($scope, $q, Tool, Workflow, Sidebar, Api, Loading, User) {

        Sidebar.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;

        $scope.view.searchTerm = '';
        $scope.view.tab = 'tools';

        $scope.view.tools = [];
        $scope.view.scripts = [];
        $scope.view.workflows = [];

        $scope.view.classes = ['page', 'apps'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /**
         * Prepare initial controller config
         */
        var prepareConfig = function() {

            var tabs = ['tools', 'scripts', 'workflows'];

            $scope.view.active = {};
            $scope.view.page = {};
            $scope.view.total = {};

            _.each(tabs, function(tab) {
                $scope.view.active[tab] = false;
                $scope.view.page[tab] = 1;
                $scope.view.total[tab] = 0;
            });

        };

        /**
         * Callback when apps are loaded
         *
         * @param {object} result
         * @param {string} tab
         */
        var appsLoaded = function(result, tab) {

            $scope.view[tab] = result.list;
            $scope.view.total[tab] = result.total;
        };

        /**
         * Load apps from the api
         *
         * @param offset
         * @returns {*}
         */
        var loadApps = function(offset) {

            offset = offset || 0;

            var deferred = $q.defer();

            $q.all([
                    Tool.getTools(offset, $scope.view.searchTerm, $scope.view.mine),
                    Tool.getScripts(offset, $scope.view.searchTerm, $scope.view.mine),
                    Workflow.getWorkflows(offset, $scope.view.searchTerm, $scope.view.mine)
                ]).then(function(result) {

                    appsLoaded(result[0], 'tools');
                    appsLoaded(result[1], 'scripts');
                    appsLoaded(result[2], 'workflows');

                    deferred.resolve('loaded');

                });

            return deferred.promise;
        };

        /* init config preparation */
        prepareConfig();

        $q.all([
                loadApps(),
                User.getUser()
            ]).then(function(result) {

                $scope.view.user = result[1].user;

                $scope.view.loading = false;
            });

        /**
         * Switch tab
         *
         * @param {string} tab - tools|scripts|workflows
         */
        $scope.switchTab = function(tab) {

            $scope.view.tab = tab;

        };

        /**
         * Get more tools by offset
         *
         * @param offset
         */
        $scope.getMoreTools = function(offset) {

            $scope.view.loading = true;

            Tool.getTools(offset, $scope.view.searchTerm, $scope.view.mine)
                .then(function(result) {
                    appsLoaded(result, 'tools');
                    $scope.view.loading = false;
                });

        };

        /**
         * Get more scripts by offset
         *
         * @param offset
         */
        $scope.getMoreScripts = function(offset) {

            $scope.view.loading = true;

            Tool.getScripts(offset, $scope.view.searchTerm, $scope.view.mine)
                .then(function(result) {
                    appsLoaded(result, 'scripts');
                    $scope.view.loading = false;
                });

        };

        /**
         * Get more workflows by offset
         *
         * @param offset
         */
        $scope.getMoreWorkflows = function(offset) {

            $scope.view.loading = true;

            Workflow.getWorkflows(offset, $scope.view.searchTerm, $scope.view.mine)
                .then(function(result) {
                    appsLoaded(result, 'workflows');
                    $scope.view.loading = false;
                });

        };

        /**
         * Search apps by the term
         */
        $scope.searchApps = function() {

            prepareConfig();

            $scope.view.loading = true;

            loadApps(0).then(function() {
                $scope.view.loading = false;
            });

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            prepareConfig();

            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            loadApps(0).then(function() {
                $scope.view.loading = false;
            });

        };

        /**
         * Toggle query for myApps filter
         */
        $scope.toggleMyApps = function () {

            prepareConfig();

            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            loadApps(0).then(function() {
                $scope.view.loading = false;
            });
        };

        /**
         * Toggle revisions visibility
         *
         * @param {string} tab
         * @param {object} app
         */
        $scope.toggleRevisions = function(tab, app) {

            if (!_.isUndefined(app)) {
                app.active = !app.active;
            } else {
                $scope.view.active[tab] = !$scope.view.active[tab];
                _.map($scope.view[tab], function(a) {
                    return a.active = $scope.view.active[tab];
                });
            }

        };

    }]);
