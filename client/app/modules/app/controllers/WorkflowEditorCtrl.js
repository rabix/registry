/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp.app')
    .controller('WorkflowEditorCtrl', ['$scope', '$rootScope', '$q', '$stateParams', '$modal', '$templateCache', 'Sidebar', 'Loading', 'Tool', 'Workflow', 'User', 'Repo', 'BeforeRedirect', 'Helper', 'PipelineService', 'Notification', 'HotkeyRegistry', 'Cliche', function ($scope, $rootScope, $q, $stateParams, $modal, $templateCache, Sidebar, Loading, Tool, Workflow, User, Repo, BeforeRedirect, Helper, PipelineService, Notification, HotkeyRegistry, Cliche) {

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
            publicRepositories: false
        };

        /* visibility flags for repo groups that hold apps */
        $scope.view.repoGroups = {};

        $scope.view.repoTypes = {
            myRepositories: {},
            publicRepositories: {}
        };

        /* list of my repos */
        $scope.view.myRepositories = {};

        /* list of other repos */
        $scope.view.publicRepositories = {};

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

        var onInstanceRegister = function () {
            PipelineInstance = PipelineService.getInstance($scope.view.id);

            PipelineInstance.getEventObj().subscribe('controller:node:select', onNodeSelect);
            PipelineInstance.getEventObj().subscribe('controller:node:deselect', onNodeDeselect);
            PipelineInstance.getEventObj().subscribe('controller:node:destroy', onNodeDestroy);

            console.log('Pipeline Instance cached', PipelineInstance);
        };

        PipelineService.register($scope.view.id, onInstanceRegister, onInstanceRegister);

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
            $scope.view.repoTypes.publicRepositories = {};

            tools = formatApps((result[0].list ? result[0].list.tools : {}));
            scripts = formatApps((result[0].list ? result[0].list.scripts : {}));
            workflows = formatApps(result[1].list || {});

            mergeToolsWorkflows('myRepositories', tools, scripts, workflows);

//            tools = formatApps((result[1].list ? result[1].list.tools : {}));
//            scripts = formatApps((result[1].list ? result[1].list.scripts : {}));
//            workflows = formatApps(result[3].list || {});
//
//            mergeToolsWorkflows('publicRepositories', tools, scripts, workflows);

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
//            Tool.getGroupedTools('other'),
            Workflow.groupedWorkflows('my'),
//            Workflow.groupedWorkflows('other')
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

        var toggleState = true;

        var toggleAll = function () {

            _.forEach($scope.view.repoTypes.myRepositories, function (obj, repo) {
                $scope.view.repoGroups[repo] = toggleState;
            });

            _.forEach($scope.view.repoTypes.publicRepositories, function (obj, repo) {
                $scope.view.repoGroups[repo] = toggleState;
            });

            $scope.view.groups.myRepositories = toggleState;
            $scope.view.groups.publicRepositories = toggleState;

            toggleState = !toggleState;

        };

        $scope.resetSearch = function () {
            $scope.view.searchTerm = '';
            toggleState = false;
            toggleAll();
        };

        $scope.$watch('view.searchTerm', function (newVal,oldVal) {

            if (oldVal !== newVal) {

                if (newVal === '') {
                    $scope.resetSearch();
                } else {
                    toggleState = true;
                    toggleAll();
                }
            }

        });

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

            $scope.view.isChanged = value.value;

            if (!value.value) {
                $scope.view.saving = false;
                $scope.view.loading = false;

                $scope.view.currentAppId = null;
                $scope.view.json = {};
            }

            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        /**
         * Initiate workflow save
         */
        $scope.save = function () {
            if (!$scope.view.isChanged) {
                Notification.error('Pipeline not updated: Graph has no changes.');
                return;
            }

            var modalInstance, mode = $scope.view.mode;

            if (!Helper.isValidName($scope.view.workflow.name) && mode === 'new') {

                $modal.open({
                    template: $templateCache.get('modules/common/views/validation.html'),
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
                    template: $templateCache.get('modules/repo/views/pick-repo-name.html'),
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
                            template: $templateCache.get('modules/common/views/validation.html'),
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
            PipelineInstance.adjustSize($scope.view.showSidebar);

        };

        /**
         * Check if particular property is not exposed anymore and remove it from values schema list
         *
         * @param {string} appName
         * @param {string} key
         */
        $scope.onExpose = function (appName, key) {

            if (!_.isUndefined($scope.view.values[appName]) && !_.isUndefined($scope.view.values[appName][key])) {

                $scope.view.suggestedValues[appName + Const.exposedSeparator + key.slice(1)] = $scope.view.values[appName][key];
                delete $scope.view.values[appName][key];
            }

            if (!_.isUndefined($scope.view.values[appName]) && _.isEmpty($scope.view.values[appName])) {
                delete $scope.view.values[appName];
            }

            $scope.onWorkflowChange({value: true, isDisplay: false});

        };

        $scope.onUnExpose = function (appName, key, value) {
            var keyName = appName + Const.exposedSeparator + key.slice(1);

            if ($scope.view.suggestedValues[keyName]) {
                delete $scope.view.suggestedValues[keyName];
            }

            if (value) {

                if (typeof $scope.view.values[appName] === 'undefined') {
                    $scope.view.values[appName] = {};
                }

                $scope.view.values[appName][key] = value;

            }
        };

        $scope.onIncludeInPorts = function (appName, key, value) {

            // call onExpose to remove values from values object
            $scope.onExpose(appName, key);
            PipelineInstance.onIncludeInPorts(appName, key, value)
        };


        // think about this when implementing multi select of nodes
        var deepNodeWatch;
        /**
         * Track node select
         */
        var onNodeSelect = function (e, model, exposed, values, suggestedValues) {

            $scope.view.json = model;

            $scope.view.values = values;
            $scope.view.exposed = exposed;
            $scope.view.suggestedValues = suggestedValues;

            _.forEach($scope.view.suggestedValues, function (sugValue, keyName) {
                var appId = keyName.split(Const.exposedSeparator)[0];
                var inputId = '#' + keyName.split(Const.exposedSeparator)[1];

                if (!$scope.view.values[appId]) {
                    $scope.view.values[appId] = {};
                    $scope.view.values[appId][inputId] = sugValue;
                }
            });

            $scope.view.required = $scope.view.json.inputs.required;

            // TODO: think about this when implementing multi select of nodes
            deepNodeWatch = $scope.$watch('view.values', function (n, o) {
                if (n !== o) {
                    $scope.onWorkflowChange({value: true, isDisplay: false});
                }
            }, true);

            $scope.view.inputCategories = _($scope.view.json.inputs).filter(filterInputs).groupBy('sbg:category').map(function(value, key){
                return {
                    name: key,
                    inputs: value,
                    show: true
                }
            }).value();

            $scope.switchTab('params');
            $scope.$digest();

        };

        function filterInputs (input) {
            var schema = Cliche.getSchema('input', input, 'tool', false);
            var type = Cliche.parseType(schema);
            var items = Cliche.getItemsType(Cliche.getItemsRef(type, schema));
            return (type !== 'File' && items !== 'File');
        }

        /**
         * Track node deselect
         */
        var onNodeDeselect = function () {

            _.forEach($scope.view.suggestedValues, function (sugValue, keyName) {
                var appId = keyName.split(Const.exposedSeparator)[0];
                var inputId = '#' + keyName.split(Const.exposedSeparator)[1];

                if ($scope.view.values[appId] && $scope.view.values[appId][inputId]) {
                    delete $scope.view.values[appId][inputId];

                    if (!_.isUndefined($scope.view.values[appId]) && _.isEmpty($scope.view.values[appId])) {
                        delete $scope.view.values[appId];
                    }
                }
            });

            $scope.view.json = {};

            if (typeof deepNodeWatch === 'function') {
                // turn off deep watch for node model
                deepNodeWatch();
            }

            $scope.switchTab('apps');
            $scope.$digest();
        };

        var onNodeDestroy = function () {
            $scope.switchTab('apps');

            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        var prompt = false;

        $scope.$on('pipeline:change', function() {
            prompt = true;
        });

//        var onNodeSelectOff = $rootScope.$on('node:select', onNodeSelect);
//        var onNodeDeselectOff = $rootScope.$on('node:deselect', onNodeDeselect);

        var onBeforeRedirectOff = BeforeRedirect.register(function () {

            var deferred = $q.defer();

            if ($stateParams.mode === 'new') {
                $scope.$broadcast('save-local', true);
            }

            deferred.resolve();

            return deferred.promise;

        }, function () {
            return prompt;
        });

        $scope.workflowToJSON = function () {
//            $scope.$broadcast('pipeline:format');
            var p = PipelineInstance.format();
            $scope.formatPipeline(p);
        };

        $scope.fork = function () {

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('modules/repo/views/pick-repo-name.html'),
                resolve: { data: function () { return { repos: $scope.view.userRepos, pickName: true, type: 'fork', message: 'Are you sure you want to fork this workflow?'}; }}
            });

            modalInstance.result.then(function (data) {
                if (data.repoId) {
                    BeforeRedirect.setReload(true);
//                    $scope.$broadcast('pipeline:fork', data.repoId, data.name);
                    PipelineInstance.fork(data.repoId, data.name);
                } else {
                    $modal.open({
                        template: $templateCache.get('modules/common/views/validation.html'),
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
                    template: $templateCache.get('modules/cliche/views/partials/app-save-response.html'),
                    controller: 'ModalCtrl',
                    backdrop: 'static',
                    resolve: { data: function () { return { trace: trace }; }}
                });

            });
        };

        $scope.formatPipeline = function(workflow) {

            var modal = $modal.open({
                template: $templateCache.get('modules/dyole/views/json-modal.html'),
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

        $scope.editMetadata = function () {

            var json = PipelineInstance.getJSON();

            var modalInstance = $modal.open({
                template: $templateCache.get('modules/dyole/views/edit-metadata.html'),
                controller: 'DyoleEditMetadataCtrl',
                windowClass: 'modal-markdown',
                size: 'lg',
                backdrop: 'static',
                resolve: {data: function () {
                    return {tool: json};
                }}
            });

            modalInstance.result.then(function (result) {
                PipelineInstance.updateMetadata(result);
                $scope.view.isChanged = !_.isEqual(result, json) || $scope.view.isChanged;
            });

        };

        /**
         * Load markdown modal for description edit
         */
        $scope.loadMarkdown = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('modules/common/views/markdown.html'),
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
                template: $templateCache.get('modules/cliche/views/partials/json-editor.html'),
                controller: 'DyoleJsonEditorCtrl',
                resolve: { options: function () { return {user: $scope.view.user}; }}
            });

            modalInstance.result.then(function (json) {

                if (json) {
                    $scope.onWorkflowChange({value: true, isDisplay: false});
                    $scope.view.workflow = json;
                }
            });

        };

        $scope.workflowSettings = function () {
            var modalInstance = $modal.open({
                template: $templateCache.get('modules/dyole/views/workflow-settings.html'),
                controller: 'WorkflowSettingsCtrl',
                resolve: { data: function () {
                    return {
                        hints: PipelineInstance.getWorkflowHints(),
                        instances: [],
                        requireSBGMetadata: PipelineInstance.getRequireSBGMetadata()
                    };
                }}
            });

            modalInstance.result.then(function (result) {
                PipelineInstance.updateWorkflowSettings(result.hints, result.requireSBGMetadata);
            });

        };


        $scope.validateWorkflowJSON = function () {

            PipelineInstance.validate().then(function (workflow) {
                $modal.open({
                    template: $templateCache.get('modules/dyole/views/json-modal.html'),
                    controller: 'ModalJSONCtrl',
                    resolve: {data: function () {
                        return {json: workflow.errors, url: false};
                    }}
                });
            });

        };

        $scope.undoAction = function () {
            // undo action;
        };

        $scope.redoAction = function () {
            //redo action
        };

        $scope.view.canUndo = function () {
            return $scope.chron ? $scope.chron.currArchivePos > 1 : false;
        };
        $scope.view.canRedo = function () {
            return $scope.chron ? $scope.chron.currArchivePos !== $scope.chron.archive.length - 1 : false;
        };

        var unloadHotkeys = HotkeyRegistry.loadHotkeys([
            {name: 'save', callback: $scope.save, preventDefault: true},
            //{name: 'run', callback: $scope.runWorkflow, preventDefault: true},
            {name: 'undo', callback: $scope.undoAction, preventDefault: true},
            {name: 'redo', callback: $scope.redoAction, preventDefault: true}
        ]);


        $scope.$on('$destroy', function () {
//            onNodeSelectOff();
//            onNodeDeselectOff();

            onBeforeRedirectOff();
            onBeforeRedirectOff = undefined;

            unloadHotkeys();

            PipelineService.removeInstance($scope.view.id);

        });

    }]);
