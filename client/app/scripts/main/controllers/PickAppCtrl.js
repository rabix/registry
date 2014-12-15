/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 12:06 PM
 */
'use strict';

angular.module('registryApp')
    .controller('PickAppCtrl', ['$scope', '$q', '$modalInstance', 'App', 'Pipeline', function ($scope, $q, $modalInstance, App, Pipeline) {

        $scope.view = {};
        $scope.view.loading = true;

        $scope.view.page = {
            tools: 1,
            scripts: 1,
            workflows: 1
        };

        $scope.view.total = {
            tools: 0,
            scripts: 0,
            workflows: 0
        };


        $scope.view.tools = [];
        $scope.view.scripts = [];
        $scope.view.workflows = [];

        $scope.view.searchTerm = '';
        $scope.view.tab = 'tools';

        $scope.view.active = {
            tools: false,
            scripts: false,
            workflows: false
        };

        /**
         * Close the modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        /**
         * Callback when apps are loaded
         *
         * @param result
         */
        var toolsLoaded = function(result) {

            $scope.view.tools = result.list;
            $scope.view.total.tools = result.total;
        };

        /**
         * Callback when scripts are loaded
         *
         * @param result
         */
        var scriptsLoaded = function(result) {

            $scope.view.scripts = result.list;
            $scope.view.total.scripts = result.total;
        };

        /**
         * Callback when workflows are loaded
         *
         * @param result
         */
        var workflowsLoaded = function(result) {

            $scope.view.workflows = result.list;
            $scope.view.total.workflows = result.total;
        };

        $q.all([
                App.getApps(0),
                App.getScripts(0),
                Pipeline.getPipelines(0)
            ]).then(function(result) {
                toolsLoaded(result[0]);
                scriptsLoaded(result[1]);
                workflowsLoaded(result[2]);

                $scope.view.loading = false;
            });

        /**
         * Get more tools by offset
         *
         * @param offset
         */
        $scope.getMoreTools = function(offset) {

            $scope.view.loading = true;

            App.getApps(offset, null, $scope.view.searchTerm).then(toolsLoaded);
        };

        /**
         * Get more scripts by offset
         *
         * @param offset
         */
        $scope.getMoreScripts = function(offset) {

            $scope.view.loading = true;

            App.getScripts(offset, $scope.view.searchTerm).then(toolsLoaded);
        };

        /**
         * Get more workflows by offset
         *
         * @param offset
         */
        $scope.getMoreWorkflows = function(offset) {

            $scope.view.loading = true;

            Pipeline.getPipelines(offset, $scope.view.searchTerm).then(workflowsLoaded);
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

            $scope.view.page.tools = 1;
            $scope.view.page.scripts = 1;
            $scope.view.page.workflows = 1;

            $scope.view.loading = true;

            $q.all([
                    App.getApps(0, null, $scope.view.searchTerm),
                    App.getScripts(0, $scope.view.searchTerm),
                    Pipeline.getPipelines(0, $scope.view.searchTerm)
                ]).then(function(result) {

                    toolsLoaded(result[0]);
                    scriptsLoaded(result[1]);
                    workflowsLoaded(result[2]);

                    $scope.view.loading = false;
                });

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page.tools = 1;
            $scope.view.page.scripts = 1;
            $scope.view.page.workflows = 1;

            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            $q.all([
                    App.getApps(0),
                    App.getScripts(0),
                    Pipeline.getPipelines(0)
                ]).then(function(result) {

                    toolsLoaded(result[0]);
                    scriptsLoaded(result[1]);
                    workflowsLoaded(result[2]);

                    $scope.view.loading = false;
                });

        };

        /**
         * Pick the app from the list
         *
         * @param {object} app
         * @param {string} type
         */
        $scope.pick = function(app, type) {

            $modalInstance.close({app: app, type: type});

        };

    }]);
