/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineEditorCtrl', ['$scope','$q', '$routeParams', 'Sidebar', 'Loading', 'App',  'Pipeline', function ($scope, $q, $routeParams, Sidebar, Loading, App, Pipeline) {

        Sidebar.setActive('_dyole');

        $scope.view = {};

        /* pipeline mode: new or edit */
        $scope.view.mode = $routeParams.mode;

        /* loading state of the page */
        $scope.view.loading = true;

        /* current tab for the right sidebar */
        $scope.view.tab = 'apps';

        /* current pipeline */
        $scope.view.pipeline = null;

        /* group visibility flags for repos */
        $scope.view.groups = {my: false, other: false};

        /* visibility flags for repo groups that hold apps */
        $scope.view.repoGroups = {};

        /* params for the currently selected app */
        $scope.view.params = {inputs: {}};

        /* list of my repos */
        $scope.view.myRepositories = {};

        /* list of other repos */
        $scope.view.otherRepositories = {};

        /* flag if something is changed: params or pipeline */
        $scope.view.isChanged = false;

        $scope.view.classes = ['page', 'dyole'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        if ($routeParams.mode === 'edit') {
            Pipeline.getPipeline($routeParams.id)
                .then(function(result) {
                    $scope.view.pipeline = result.data;
                });
        } else {
            $scope.view.pipeline = {name: 'New Pipeline'};
        }

        /**
         * Callback when apps are loaded
         *
         * @param {Object} result
         */
        var appsLoaded = function (result) {

            $scope.view.loading = false;
            $scope.view.message = result[0].message;

            $scope.view.myRepositories = result[0].list || {};
            $scope.view.otherRepositories = result[1].list || {};

            // TODO: remove later, this is mock
            var repositories = _.isEmpty($scope.view.otherRepositories) ? $scope.view.myRepositories : $scope.view.otherRepositories;
            var repos = _.keys(repositories);
            var repo = repos[_.random(0, repos.length - 1)];

            $scope.view.json = repositories[repo][0].json;

        };

        /* params watcher reference */
        var paramsWatcher;

        /**
         * Watch the params in order to recognizes changes
         */
        var watchParams = function () {
            paramsWatcher = $scope.$watch('view.params', function(n, o) {
                if (n !== o) { $scope.view.isChanged = true; }
            }, true);
        };

        /**
         * Unwatch params
         */
        var unWatchParams = function () {

            if (_.isFunction(paramsWatcher)) {
                paramsWatcher.call();
                paramsWatcher = undefined;
            }
        };

        /* load apps grouped by repositories */
        $q.all([
            App.getGroupedApps('my'),
            App.getGroupedApps('other')
        ]).then(appsLoaded);

        /**
         * Switch tab on the right side
         *
         * @param {string} tab
         */
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;

            if (tab === 'params') {
                watchParams();
            } else {
                unWatchParams();
            }
        };

        /**
         * Toggle top level groups
         * @param group
         */
        $scope.toggleGroup = function (group) {
            $scope.view.groups[group] = !$scope.view.groups[group];
        };

        /**
         * Toggle repo list visibility
         *
         * @param repo
         */
        $scope.toggleRepo = function (repo) {
            if (_.isUndefined($scope.view.repoGroups[repo])) {
                $scope.view.repoGroups[repo] = false;
            }
            $scope.view.repoGroups[repo] = !$scope.view.repoGroups[repo];
        };

        /**
         * Search apps by the term
         */
        $scope.filterApps = function() {

            $scope.view.loading = true;

            $q.all([
                App.getGroupedApps('my', $scope.view.searchTerm),
                App.getGroupedApps('other', $scope.view.searchTerm)
            ]).then(function (result) {
                appsLoaded(result);

                $scope.view.repoGroups = {};
                $scope.view.groups = {my: true, other: true};

                _.times(2, function (i) {
                    _.each(_.keys(result[i].list), function (repoName) {
                        $scope.view.repoGroups[repoName] = true;
                    });
                });
            });

        };

        /**
         * Reset the search
         */
        $scope.resetFilter = function() {

            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            $q.all([
                App.getGroupedApps('my'),
                App.getGroupedApps('other')
            ]).then(appsLoaded);

        };

        /**
         * Callback when pipeline is changed
         */
        $scope.onPipelineChange = function () {

            $scope.view.isChanged = true;
            $scope.$digest();

        };

    }]);
