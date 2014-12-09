/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 12:06 PM
 */
'use strict';

angular.module('registryApp')
    .controller('PickAppCtrl', ['$scope', '$q', '$modalInstance', 'App', 'Pipeline', function ($scope, $q, $modalInstance, App, Pipeline) {

        $scope.view = {};
        $scope.view.page = {
            tools: 1,
            workflows: 1
        };
        $scope.view.total = {
            tools: 0,
            workflows: 0
        };
        $scope.view.loading = true;
        $scope.view.tools = [];
        $scope.view.workflows = [];
        $scope.view.searchTerm = '';
        $scope.view.tab = 'tools';
        $scope.view.active = {
            tools: false,
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
        var appsLoaded = function(result) {

            $scope.view.tools = result.list;
            $scope.view.total.tools = result.total;
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
                Pipeline.getPipelines(0)
            ]).then(function(result) {
                appsLoaded(result[0]);
                workflowsLoaded(result[1]);

                $scope.view.loading = false;
            });

        /**
         * Get more tools by offset
         *
         * @param offset
         */
        $scope.getMoreTools = function(offset) {

            $scope.view.loading = true;

            App.getApps(offset, null, $scope.view.searchTerm).then(appsLoaded);
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
            $scope.view.page.workflows = 1;
            $scope.view.loading = true;

            $q.all([
                    App.getApps(0, null, $scope.view.searchTerm),
                    Pipeline.getPipelines(0, $scope.view.searchTerm)
                ]).then(function(result) {
                    appsLoaded(result[0]);
                    workflowsLoaded(result[1]);

                    $scope.view.loading = false;
                });

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page.tools = 1;
            $scope.view.page.workflows = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            $q.all([
                    App.getApps(0),
                    Pipeline.getPipelines(0)
                ]).then(function(result) {
                    appsLoaded(result[0]);
                    workflowsLoaded(result[1]);

                    $scope.view.loading = false;
                });

        };

        /**
         * Pick the app from the list
         *
         * @param app
         * @param type
         */
        $scope.pick = function(app, type) {

            $modalInstance.close({app: app, type: type});

        };

    }]);
