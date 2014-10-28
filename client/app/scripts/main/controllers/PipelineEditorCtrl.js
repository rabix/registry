/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineEditorCtrl', ['$scope', '$rootScope', '$q', '$routeParams', 'Sidebar', 'Loading', 'App', 'Pipeline', function ($scope, $rootScope, $q, $routeParams, Sidebar, Loading, App, Pipeline) {

        Sidebar.setActive('_dyole');

        $scope.view = {};

        /* pipeline mode: new or edit */
        $scope.view.mode = $routeParams.mode;

        /* loading state of the page */
        $scope.view.loading = true;

        /* current tab for the right sidebar */
        $scope.view.tab = 'apps';

        /* current pipeline */
        $scope.view.pipeline = {};

        /* group visibility flags for repos */
        $scope.view.groups = {
            my: false,
            other: false
        };

        /* visibility flags for repo groups that hold apps */
        $scope.view.repoGroups = {};

        /* params for the currently selected app */
        $scope.view.params = {};

        /* list of my repos */
        $scope.view.myRepositories = {};

        /* list of other repos */
        $scope.view.otherRepositories = {};

        /* flag if something is changed: params or pipeline */
        $scope.view.isChanged = false;

        /* flag when save is clicked */
        $scope.view.saveing = false;

        /* Pipeline edit mode flag */
        $scope.view.editMode = true;

        /* ID of the currently selected node */
        $scope.view.currentAppId = null;

        $scope.view.classes = ['page', 'dyole'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function (n, o) {
            if (n !== o) {
                $scope.view.classes = n;
            }
        });

        if ($routeParams.mode === 'edit') {
            Pipeline.getPipeline($routeParams.id)
                .then(function (result) {
                    $scope.view.pipeline = result.data;
                });
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

        };

        /* params watcher reference */
        var paramsWatcher;

        /**
         * Watch the params in order to recognizes changes
         */
        var watchParams = function () {
            paramsWatcher = $scope.$watch('view.params', function (n, o) {
                if (n !== o) {
                    $scope.view.isChanged = true;
                }
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
        $scope.filterApps = function () {

            $scope.view.loading = true;

            $q.all([
                App.getGroupedApps('my', $scope.view.searchTerm),
                App.getGroupedApps('other', $scope.view.searchTerm)
            ]).then(function (result) {
                appsLoaded(result);

                $scope.view.repoGroups = {};
                $scope.view.groups = {
                    my: true,
                    other: true
                };

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
        $scope.resetFilter = function () {

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
        $scope.onPipelineChange = function (value) {

            $scope.view.isChanged = value;

            if (value) {
                $scope.$digest();
            } else {
                $scope.view.saving = false;
                $scope.view.loading = false;

                $scope.view.currentAppId = null;
                $scope.view.json = {};
            }

        };

        /**
         * Initiate pipeline save
         */
        $scope.save = function () {

            if (!$scope.view.pipeline.name) {
                return false;
            }

            $scope.view.saving = true;
            $scope.view.loading = true;

            $scope.$broadcast('save', $scope.view.params);
        };

        /**
         * Track node select
         */
        var cancelNodeSelectEL = $rootScope.$on('node:select', function (e, model) {

            console.log(model);
            $scope.view.currentAppId = model._id;
            $scope.view.json = model.json;

            if (_.isUndefined($scope.view.params[model._id])) {
                $scope.view.params[model._id] = {};
            }

            console.log($scope.view.params);

            $scope.$digest();

        });

        /**
         * Track node deselect
         */
        var cancelNodeDeselectEL = $rootScope.$on('node:deselect', function () {

            $scope.view.currentAppId = null;
            $scope.view.json = {};

            $scope.$digest();

        });

        $scope.$on('$destroy', function() {
            cancelNodeSelectEL();
            cancelNodeDeselectEL();
        });


    }
    ]);
