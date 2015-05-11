/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 12:06 PM
 */
'use strict';

angular.module('registryApp.task')
    .controller('PickAppCtrl', ['$scope', '$q', '$modalInstance', 'Tool', 'Workflow', function ($scope, $q, $modalInstance, Tool, Workflow) {

        $scope.view = {};

        $scope.view.loading = true;

        $scope.view.tools = [];
        $scope.view.scripts = [];
        $scope.view.workflows = [];

        $scope.view.searchTerm = '';
        $scope.view.tab = 'tools';

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
                    Tool.getTools(offset, $scope.view.searchTerm),
                    Tool.getScripts(offset, $scope.view.searchTerm),
                    Workflow.getWorkflows(offset, $scope.view.searchTerm)
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

        loadApps()
            .then(function() {
                $scope.view.loading = false;
            });

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        /**
         * Get more tools by offset
         *
         * @param offset
         */
        $scope.getMoreTools = function(offset) {

            $scope.view.loading = true;

            Tool.getTools(offset, $scope.view.searchTerm)
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

            Tool.getScripts(offset, $scope.view.searchTerm)
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

            Workflow.getWorkflows(offset, $scope.view.searchTerm)
                .then(function(result) {
                    appsLoaded(result, 'workflows');
                    $scope.view.loading = false;
                });
        };

        /**
         * Toggle revisions visibility
         *
         * @param app
         */
        $scope.toggleRevisions = function(what, app) {

            if (app) {
                app.active = !app.active;
            } else {
                $scope.view.active[what] = !$scope.view.active[what];
                _.map($scope.view[what], function(a) {
                    return a.active = $scope.view.active[what];
                });
            }

        };

        /**
         * Switch the tab
         * @param tab
         */
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;
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
         * Pick the app from the list
         *
         * @param {string} id
         * @param {object} app
         * @param {string} type - available values CommandLine|Script|Workflow
         */
        $scope.pick = function(id, app, type) {

            app.json = _.isString(app.json) ? JSON.parse(app.json) : app.json;

            $modalInstance.close({app: app, type: type, id: id});

        };

    }]);
