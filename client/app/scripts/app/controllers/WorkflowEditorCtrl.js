/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp.app')
    .controller('WorkflowEditorCtrl', ['$scope', '$rootScope', '$q', '$stateParams', '$modal', '$templateCache', 'Sidebar', 'Loading', 'Tool', 'Workflow', 'User', 'Repo', 'BeforeRedirect', 'Helper', 'PipelineService', function ($scope, $rootScope, $q, $stateParams, $modal, $templateCache, Sidebar, Loading, Tool, Workflow, User, Repo, BeforeRedirect, Helper, PipelineService) {

        Sidebar.setActive('workflow editor');

        var PipelineInstance = null;

        $scope.view = {};

        /* workflow mode: new or edit */
        $scope.view.mode = $stateParams.mode;

        /* loading state of the page */
        $scope.view.loading = true;

        /* current tab for the right sidebar */
        $scope.view.tab = 'apps';

        /* current workflow */
        $scope.view.workflow = {};

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

        /* flag if something is changed: params or workflow */
        $scope.view.isChanged = false;

        /* flag when save is clicked */
        $scope.view.saving = false;

        /* flag for sidebar visibility */
        $scope.view.showSidebar = true;

        $scope.view.classes = ['page', 'workflow-edit'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;

        $scope.view.appRevisions = {};

        /**
         * Set controller id for pipeline Service to use it
         *
         * @type {string}
         */
        $scope.view.id = 'workflowEditorCtrl';

        $scope.$watch('Loading.classes', function (n, o) {
            if (n !== o) {
                $scope.view.classes = n;
            }
        });

        PipelineService.register($scope.view.id, function () {
            PipelineInstance = PipelineService.getInstance($scope.view.id);

            console.log('Pipeline Instance cached', PipelineInstance);
        });

        $q.all([
                User.getUser(),
                Repo.getRepos(0, '', true)
            ]).then(function(result) {
                $scope.view.user = result[0].user;
                $scope.view.userRepos = result[1].list;
            });

        if ($stateParams.mode === 'edit') {
            Workflow.getRevision($stateParams.id)
                .then(function (result) {
                    $scope.view.workflow = result.data;
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
                            return rev.version === value.latest.version;
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

        /* load tools/workflows grouped by repositories */
        $q.all([
            Tool.getGroupedTools('my'),
            Tool.getGroupedTools('other'),
            Workflow.groupedWorkflows('my'),
            Workflow.groupedWorkflows('other')
        ]).then(appsLoaded);

        /**
         * Switch tab on the right side
         *
         * @param {string} tab
         */
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;
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
         * Callback when workflow is changed
         */
        $scope.onWorkflowChange = function (value) {

            $scope.view.isChanged = value;

            if (!value) {
                $scope.view.saving = false;
                $scope.view.loading = false;

                $scope.view.currentAppId = null;
                $scope.view.json = {};
            }

        };

        /**
         * Initiate workflow save
         */
        $scope.save = function () {
            var modalInstance, mode = $scope.view.mode;

            if (!Helper.isValidName($scope.view.workflow.name) && mode === 'new') {

                $modal.open({
                    template: $templateCache.get('views/partials/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: ['You must enter valid name (avoid characters \'$\' and \'.\')']}; }}
                });

                return false;

            } else if (mode === 'edit') {
                BeforeRedirect.setReload(true);
//                $scope.$broadcast('save', null);
                PipelineInstance.save(null);
            } else {
                modalInstance = $modal.open({
                    controller: 'PickRepoModalCtrl',
                    template: $templateCache.get('views/repo/pick-repo-name.html'),
                    windowClass: 'modal-confirm',
                    resolve: {data: function () { return {repos: $scope.view.userRepos, type: 'save'};}}
                });
            }

            if (typeof modalInstance !== 'undefined') {

                modalInstance.result.then(function (data) {

                    if (typeof data.repoId !== 'undefined') {

                        BeforeRedirect.setReload(true);
                        $scope.view.saving = true;
                        $scope.view.loading = true;
//                        $scope.$broadcast('save', data.repoId);
                        PipelineInstance.save(data.repoId);

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
//            $rootScope.$broadcast('sidebar:toggle', $scope.view.showSidebar);
            PipelineInstance.adjustSize();

        };

        /**
         * Check if particular property is not exposed anymore and remove it from values schema list
         *
         * @param {string} appName
         * @param {string} key
         */
        $scope.onExpose = function (appName, key) {

            if (!_.isUndefined($scope.view.values[appName]) && !_.isUndefined($scope.view.values[appName][key])) {
                delete $scope.view.values[appName][key];
            }

            if (!_.isUndefined($scope.view.values[appName]) && _.isEmpty($scope.view.values[appName])) {
                delete $scope.view.values[appName];
            }

            console.log($scope.view.exposed);
            console.log($scope.view.values);

        };

        /**
         * Track node select
         */
        var onNodeSelect = function (e, model, exposed, values) {

            $scope.view.json = model;

            $scope.view.values = values;
            $scope.view.exposed = exposed;

            $scope.view.required = $scope.view.json.inputs.required;

            $scope.$digest();

        };

        /**
         * Track node deselect
         */
        var onNodeDeselect = function () {

            $scope.view.json = {};

            $scope.$digest();

        };

        var onNodeSelectOff = $rootScope.$on('node:select', onNodeSelect);
        var onNodeDeselectOff = $rootScope.$on('node:deselect', onNodeDeselect);

        var onBeforeRedirectOff = BeforeRedirect.register(function () {

            var deferred = $q.defer();

            if ($stateParams.mode === 'new') {
                $scope.$broadcast('save-local', true);
            }

            deferred.resolve();

            return deferred.promise;

        });

        $scope.workflowToJSON = function () {
//            $scope.$broadcast('pipeline:format');
            var p = PipelineInstance.format();
            $scope.formatPipeline(p);
        };

        $scope.fork = function () {

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/repo/pick-repo-name.html'),
                resolve: { data: function () { return { repos: $scope.view.userRepos, pickName: true, type: 'fork', message: 'Are you sure you want to fork this workflow?'}; }}
            });

            modalInstance.result.then(function (data) {
                if (data.repoId) {
                    BeforeRedirect.setReload(true);
//                    $scope.$broadcast('pipeline:fork', data.repoId, data.name);
                    PipelineInstance.fork(data.repoId, data.name);
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
            Workflow.publishRevision($scope.view.workflow._id, {publish: true}).then(function (data) {
                var trace = data;

                $modal.open({
                    template: $templateCache.get('views/cliche/partials/app-save-response.html'),
                    controller: 'ModalCtrl',
                    backdrop: 'static',
                    resolve: { data: function () { return { trace: trace }; }}
                });

            });
        };

        $scope.formatPipeline = function(workflow) {

            var modal = $modal.open({
                template: $templateCache.get('views/dyole/json-modal.html'),
                controller: 'ModalJSONCtrl',
                resolve: {data: function () {
                    return {json: workflow};
                }}
            });

            modal.result.then(function () {
                PipelineInstance.getUrl();
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
                resolve: {data: function () {return {markdown: $scope.view.workflow.description};}}
            });

            modalInstance.result.then(function(result) {
                $scope.view.workflow.description = result;
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
                    $scope.view.workflow = json;
                }
            });

        };
        
        $scope.validateWorkflowJSON = function () {

            PipelineInstance.validate().then(function (workflow) {
                $modal.open({
                    template: $templateCache.get('views/dyole/json-modal.html'),
                    controller: 'ModalJSONCtrl',
                    resolve: {data: function () {
                        return {json: workflow.errors, url: false};
                    }}
                });
            });

        };

        $scope.$on('$destroy', function () {
            onNodeSelectOff();
            onNodeDeselectOff();

            onBeforeRedirectOff();
            onBeforeRedirectOff = undefined;

            PipelineService.removeInstance($scope.view.id);

        });

    }]);
