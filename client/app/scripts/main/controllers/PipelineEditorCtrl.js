/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineEditorCtrl', ['$scope', '$rootScope', '$q', '$routeParams', '$modal', '$templateCache', '$location', 'Sidebar', 'Loading', 'App', 'Pipeline', 'User', 'Repo', function ($scope, $rootScope, $q, $routeParams, $modal, $templateCache, $location, Sidebar, Loading, App, Pipeline, User, Repo) {

        Sidebar.setActive('dyole');

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
            myRepositories: false,
            otherRepositories: false
        };

        /* visibility flags for repo groups that hold apps */
        $scope.view.repoGroups = {};

        $scope.view.repoTypes = {
            myRepositories: {},
            otherRepositories: {}
        };

        /* list of my repos */
        $scope.view.myRepositories = {};

        /* list of other repos */
        $scope.view.otherRepositories = {};

        /* list of user repos*/
        $scope.view.userRepos= [];

        /* flag if something is changed: params or pipeline */
        $scope.view.isChanged = false;

        /* flag when save is clicked */
        $scope.view.saving = false;

        /* flag to enforce page reload */
        $scope.view.reload = false;

        /* flag for sidebar visibility */
        $scope.view.showSidebar = true;

        $scope.view.classes = ['page', 'pipeline-edit'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;

        $scope.$watch('Loading.classes', function (n, o) {
            if (n !== o) {
                $scope.view.classes = n;
            }
        });

        User.getUser().then(function (result) {
            $scope.view.user = result.user;
        });

        Repo.getRepos(0, '', true).then(function (repos) {
            $scope.view.userRepos = repos.list;
        });

        if ($routeParams.mode === 'edit') {
            Pipeline.getRevision($routeParams.id)
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
            var tools, workflows, scripts;
            $scope.view.loading = false;
            $scope.view.filtering = false;
            $scope.view.message = result[0].message;

            $scope.view.repoTypes.myRepositories = {};
            $scope.view.repoTypes.otherRepositories = {};

            tools = formatApps((result[0].list ? result[0].list.tools : {}));
            scripts = formatApps((result[0].list ? result[0].list.scripts : {}));
            workflows = formatApps(result[2].list || {});

            mergeToolsWorkflows('myRepositories', tools, scripts, workflows);

            tools = formatApps((result[1].list ? result[1].list.tools : {}));
            scripts = formatApps((result[1].list ? result[1].list.scripts : {}));
            workflows = formatApps(result[3].list || {});
            
            mergeToolsWorkflows('otherRepositories', tools, scripts, workflows);

        };

        $scope.view.appRevisions = {};
        var formatApps = function (apps) {

            if (!apps) {
                return {};
            }

            _.each(apps, function (apps) {
                _.each(apps, function (value) {

                    if (!value.latest) {
                        value.latest = angular.copy(value.revisions[0]);
                        value.revisions.splice(0,1);
                    } else {
                        _.remove(value.revisions, function (rev) {
                            return rev.rev === value.latest.rev;
                        });
                    }

                    $scope.view.appRevisions[value._id] = {
                        toggled: false
                    };

                });
            });

            return apps;
        };
        
        var mergeToolsWorkflows = function (type, tools, scripts, workflows) {
            var repositories = $scope.view.repoTypes[type];

            _.forEach(tools, function (tool, repoName) {
                if (!repositories[repoName]) {
                    repositories[repoName] = {
                        tools: tool,
                        scripts: [],
                        workflows: []
                    };
                } else {
                    repositories[repoName].tools = tool;
                }
            });

            _.forEach(scripts, function (script, repoName) {
                if (!repositories[repoName]) {
                    repositories[repoName] = {
                        tools: [],
                        scripts: script,
                        workflows: []
                    };
                } else {
                    repositories[repoName].scripts = script;
                }
            });


            _.forEach(workflows, function (workflow, repoName) {
                if (!repositories[repoName]) {
                    repositories[repoName] = {
                        tools: [],
                        scripts: [],
                        workflows: workflow
                    };
                } else {
                    repositories[repoName].workflows = workflow;
                }
            });
        };

        $scope.toggleAppRevisions = function (rev) {
            $scope.view.appRevisions[rev].toggled = !$scope.view.appRevisions[rev].toggled;
        };
        /* params watcher reference */
        var paramsWatcher;

        /**
         * Watch the params in order to recognizes changes
         */
        var watchParams = function () {
            paramsWatcher = $scope.$watch('view.json.params', function (n, o) {
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

        /* load tools/workflows grouped by repositories */
        $q.all([
            App.getGroupedTools('my'),
            App.getGroupedTools('other'),
            Pipeline.groupedWorkflows('my'),
            Pipeline.groupedWorkflows('other')
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

            $scope.view.filtering = true;

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
            $scope.view.filtering = false;

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

            if (!value) {
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
            var modalInstance, mode = $scope.view.mode;

            if (!$scope.view.pipeline.name && mode === 'new') {

                $modal.open({
                    template: $templateCache.get('views/partials/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: ['You must enter pipeline name']}; }}
                });

                return false;

            } else if (mode === 'edit') {
                $scope.view.reload = true;
                $scope.$broadcast('save', null);
            } else {
                modalInstance = $modal.open({
                    controller: 'PickRepoModalCtrl',
                    template: $templateCache.get('views/dyole/pick-repo-name.html'),
                    windowClass: 'modal-confirm',
                    resolve: {data: function () { return {repos: $scope.view.userRepos, type: 'save'};}}
                });
            }

            if (typeof modalInstance !== 'undefined') {

                modalInstance.result.then(function (data) {

                    if (typeof data.repoId !== 'undefined') {

                        $scope.view.reload = true;
                        $scope.view.saving = true;
                        $scope.view.loading = true;
                        $scope.$broadcast('save', data.repoId);

                    } else {

                        $modal.open({
                            template: $templateCache.get('views/partials/validation.html'),
                            size: 'sm',
                            controller: 'ModalCtrl',
                            windowClass: 'modal-validation',
                            resolve: {data: function () { return {messages: ['You must pick repo name']}; }}
                        });

                    }



                });
            }


        };

        $scope.toggleSidebar = function() {

            $scope.view.showSidebar = !$scope.view.showSidebar;
            $rootScope.$broadcast('sidebar:toggle', $scope.view.showSidebar);

        };

        /**
         * Track node select
         */
        var onNodeSelect = function (e, model) {

            if (_.isUndefined(model.params)) { model.params = {}; }

            $scope.view.json = model;

            $scope.$digest();

        };

        /**
         * Track node deselect
         */
        var onNodeDeselect = function () {

            $scope.view.json = {};

            $scope.$digest();

        };


        /**
         * Track route change in order to prevent loss of changes
         *
         * @param e
         * @param nextLocation
         */
        var onRouteChange = function(e, nextLocation) {

            if($scope.view.reload) { return; }

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-leave.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () {return {};}}
            });

            modalInstance.result.then(function () {

                onRouteChangeOff();

                $scope.view.reload = true;

                if ($routeParams.mode === 'new') { $scope.$broadcast('save-local', true); }

                $location.path(nextLocation.split('#\/')[1]);

            });

            e.preventDefault();

        };

        var onNodeSelectOff = $rootScope.$on('node:select', onNodeSelect);
        var onNodeDeselectOff = $rootScope.$on('node:deselect', onNodeDeselect);
        var onRouteChangeOff = $rootScope.$on('$locationChangeStart', onRouteChange);

        $scope.$on('$destroy', function () {
            onNodeSelectOff();
            onNodeDeselectOff();
            onRouteChangeOff();

        });

        $scope.pipelineToJSON = function () {
            $scope.$broadcast('pipeline:format');
        };

        $scope.fork = function () {

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/dyole/pick-repo-name.html'),
                resolve: { data: function () { return { repos: $scope.view.userRepos, pickName: true, type: 'fork', message: 'Are you sure you want to fork this workflow?'}; }}
            });

            modalInstance.result.then(function (data) {
                if (data.repoId) {
                    $scope.view.reload = true;
                    $scope.$broadcast('pipeline:fork', data.repoId, data.name);
                } else {
                    $modal.open({
                        template: $templateCache.get('views/partials/validation.html'),
                        size: 'sm',
                        controller: 'ModalCtrl',
                        windowClass: 'modal-validation',
                        resolve: {data: function () { return {messages: ['You must pick repo name']}; }}
                    });

                }
            });

        };
        
        $scope.publish = function () {
            Pipeline.publishRevision($scope.view.pipeline._id, {publish: true}).then(function (data) {
                var trace = data;

                $modal.open({
                    template: $templateCache.get('views/cliche/partials/app-save-response.html'),
                    controller: 'ModalCtrl',
                    backdrop: 'static',
                    resolve: { data: function () { return { trace: trace }; }}
                });

            });
        };

        $scope.formatPipeline = function(pipeline) {

            var modal = $modal.open({
                template: $templateCache.get('views/dyole/json-modal.html'),
                controller: 'ModalJSONCtrl',
                resolve: {data: function () {
                    return {json: pipeline};
                }}
            });

            modal.result.then(function () {
                $scope.$broadcast('pipeline:get:url');
            });

        };

        /**
         * Toggle dropdown menu
         */
        $scope.toggleMenu = function() {

            $scope.view.isMenuOpen = !$scope.view.isMenuOpen;

        };
        
        $scope.view.capitalize = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };

        /**
         * Load markdown modal for description edit
         */
        $scope.loadMarkdown = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/markdown.html'),
                controller: 'MarkdownCtrl',
                windowClass: 'modal-markdown',
                size: 'lg',
                backdrop: 'static',
                resolve: {data: function () {return {markdown: $scope.view.pipeline.description};}}
            });

            modalInstance.result.then(function(result) {
                $scope.view.pipeline.description = result;
            });
        };

        /**
         * Load json importer
         */
        $scope.loadJsonImport = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/json-editor.html'),
                controller: 'DyoleJsonEditorCtrl',
                resolve: { options: function () { return {user: $scope.view.user}; }}
            });

            modalInstance.result.then(function (json) {

                if (json) {
                    $scope.view.pipeline = json;
                }
            });

        };


    }]);
