/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ClicheCtrl', ['$scope', '$q', '$modal', '$templateCache', '$routeParams', '$location', 'Data', 'User', 'Tool', 'Repo', 'Loading', 'SandBox', 'Sidebar', 'BeforeUnload', 'BeforeRedirect', function ($scope, $q, $modal, $templateCache, $routeParams, $location, Data, User, Tool, Repo, Loading, SandBox, Sidebar, BeforeUnload, BeforeRedirect) {

        Sidebar.setActive($routeParams.type + ' editor');

        var schema = 'https://github.com/common-workflow-language/common-workflow-language/blob/draft-1/specification/tool-description.md';

        $scope.view = {};
        $scope.forms = {};

        $scope.view.DataMdl = Data;

        $scope.view.tab = 'general';
        $scope.view.saving = false;
        $scope.view.app = {};

        /* cliche mode: new or edit */
        $scope.view.mode = $routeParams.id ? 'edit' : 'new';

        /* list of user repos*/
        $scope.view.userRepos = [];

        $scope.view.showConsole = true;

        $scope.view.propsExpanded = {
            inputs: false,
            outputs: false,
            args: false
        };

        $scope.view.active = {
            inputs: {},
            outputs: {},
            args: {}
        };

        $scope.view.perPage = 10;

        $scope.view.classes = ['page', 'cliche'];
        $scope.view.user = null;

        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /* tool form obj */
        $scope.view.toolForm = Data.tool;
        /* job form obj */
        $scope.view.jobForm = Data.job;

        $scope.view.loading = true;

        Repo.getRepos(0, '', true).then(function (repos) {
            $scope.view.userRepos = repos.list;
        });

        $scope.view.pages = {values: []};
        $scope.view.page = {inputs: 1, outputs: 1, values: 1};
        $scope.view.total = {inputs: 0, outputs: 0, values: 0};

        $scope.view.fakeRequired = [];

        $scope.view.type = $routeParams.type;

        /**
         * Prepare temp list for paginating
         *
         * @param origin
         * @param what
         */
        $scope.prepareForPagination = function(origin, what) {

            $scope.view.total[what] = _.size(origin);

            var count = 0;
            $scope.view.pages[what] = [];
            $scope.view.page[what] = 1;

            _.each(origin, function(obj, name) {
                if (count % 10 === 0) {
                    $scope.view.pages[what].push([]);
                }

                $scope.view.pages[what][$scope.view.pages[what].length - 1].push({key: name, obj: obj});

                count += 1;
            });

        };

        /**
         * Initiate command generating
         */
        $scope.generateCommand = function() {
            Data.generateCommand();
        };

        if ($routeParams.id) {

            $q.all([
                    Tool.getTool($routeParams.id, $routeParams.revision),
                    User.getUser()
                ]).then(function(result) {

                    $scope.view.loading = false;

                    $scope.view.app = result[0].data;
                    $scope.view.revision = result[0].revision;
                    $scope.view.user = result[1].user;

                    var json = _.extend({
                        name: $scope.view.app.name,
                        schema: schema,
                        description: $scope.view.revision.description
                    }, $scope.view.revision.json);

                    // legacy structure
                    delete json.softwareDescription;

                    Data.setTool(json);
                    $scope.view.toolForm = Data.tool;

                    if (_.isUndefined($scope.view.toolForm.inputs.properties)) {
                        $scope.view.toolForm.inputs.properties = {};
                    }
                    if (_.isUndefined($scope.view.toolForm.outputs.properties)) {
                        $scope.view.toolForm.outputs.properties = {};
                    }

                    Data.setJob();
                    $scope.view.jobForm = Data.job;

                    if ($scope.view.showConsole) { turnOnDeepWatch(); }

                    $scope.prepareForPagination(Data.tool.inputs.properties, 'values');

                });

        } else {

            Data.checkStructure().then(function() {
                $q.all([
                        Data.fetchTool(),
                        Data.fetchJob(),
                        User.getUser()
                    ]).then(function(result) {

                        $scope.view.loading = false;

                        $scope.view.user = result[2].user;

                        $scope.view.app.is_script = $routeParams.type === 'script';
                        Data.transformToolJson($scope.view.app.is_script);

                        $scope.view.toolForm = Data.tool;
                        if ($scope.view.user) {
                            $scope.view.toolForm.documentAuthor = $scope.view.user.login;
                        }
                        if (_.isUndefined($scope.view.toolForm.schema)) {
                            $scope.view.toolForm.schema = schema;
                        }

                        //$scope.view.app.is_script = !Data.tool.adapter;

                        $scope.view.jobForm = Data.job;

                        if ($scope.view.showConsole) { turnOnDeepWatch(); }

                        $scope.prepareForPagination(Data.tool.inputs.properties, 'values');

                    });
            });

        }

        /**
         * Update input values form when props are changed
         */
        $scope.updateInputs = function () {

            $scope.prepareForPagination(Data.tool.inputs.properties, 'values');

        };

        /**
         * Toggle properties visibility (expand/collapse)
         * @param {string} tab
         */
        $scope.toggleProperties = function(tab) {

            if ($routeParams.type === 'script') { return false; }

            $scope.view.propsExpanded[tab] = !$scope.view.propsExpanded[tab];

            var props = (tab !== 'args') ? $scope.view.toolForm[tab].properties : $scope.view.toolForm.adapter.args;

            _.each(props, function(value, key) {
                $scope.view.active[tab][key] = $scope.view.propsExpanded[tab];
            });

        };

        /**
         * Switch the tab
         * @param tab
         */
        $scope.switchTab = function(tab) {
            $scope.view.tab = tab;

            if (tab === 'values') {
                watchTheJob();
            } else {
                unWatchTheJob();
            }

        };

        /* watchers list */
        var watchers = [];

        /**
         * Turn on deep watch when console tab is visible
         */
        var turnOnDeepWatch = function() {

            if (!$scope.view.app.is_script) {

                $scope.view.generatingCommand = true;
                Data.generateCommand()
                    .then(function (command) {
                        $scope.view.command = command;
                        $scope.view.generatingCommand = false;
                    });

                var watch = [
                    'view.toolForm.adapter.baseCmd',
                    'view.toolForm.adapter.stdout',
                    'view.toolForm.adapter.stdin'
                ];

                _.each(watch, function(arg) {
                    var watcher = $scope.$watch(arg, function(n, o) {
                        if (n !== o) {
                            $scope.view.generatingCommand = true;
                            Data.generateCommand()
                                .then(function (command) {
                                    $scope.view.command = command;
                                    $scope.view.generatingCommand = false;
                                });
                        }
                    }, true);
                    watchers.push(watcher);
                });
            }

        };

        $scope.$watch('view.DataMdl.command', function(n, o) {
            if (n !== o) { $scope.view.command = n; }
        });

        /**
         * Turn off deep watch when console tab is hidden
         */
        var turnOffDeepWatch = function() {

            _.each(watchers, function(watcher) {
                if (_.isFunction(watcher)) {
                    watcher.call();
                }
            });

            watchers = [];
        };

        var jobWatcher;

        /**
         * Check if there are expressions applied on resources and evaluate
         * them in order to refresh result for the allocated resources
         */
        var checkResources = function () {

            _.each($scope.view.toolForm.requirements.resources, function (resource, key) {

                if (_.isObject(resource) && _.contains(resource.$expr, '$job')) {
                    SandBox.evaluate(resource.$expr, {})
                        .then(function (result) {
                            $scope.view.jobForm.allocatedResources[key] = result;
                        }, function (error) {
                            console.log(error);
                        });
                }
            });
        };

        /**
         * Watch the job's inputs in order to evaluate
         * expression which include $job as context
         */
        var watchTheJob = function () {

            if (!$scope.view.app.is_script) {

                checkResources();

                if ($scope.view.showConsole) {
                    $scope.view.generatingCommand = true;
                    Data.generateCommand()
                        .then(function (command) {
                            $scope.view.command = command;
                            $scope.view.generatingCommand = false;
                        });
                }

                jobWatcher = $scope.$watch('view.jobForm.inputs', function(n, o) {
                    if (n !== o) {
                        checkResources();
                        if ($scope.view.showConsole) {
                            $scope.view.generatingCommand = true;
                            Data.generateCommand()
                                .then(function (command) {
                                    $scope.view.command = command;
                                    $scope.view.generatingCommand = false;
                                });
                        }
                    }
                }, true);

            }

        };

        /**
         * Unwatch job's inputs
         */
        var unWatchTheJob = function () {

            if (_.isFunction(jobWatcher)) {
                jobWatcher.call();
                jobWatcher = undefined;
            }
        };

        /**
         * Toggle console visibility
         */
        $scope.toggleConsole = function() {

            $scope.view.showConsole = !$scope.view.showConsole;

            if ($scope.view.showConsole) {
                turnOnDeepWatch();
            } else {
                turnOffDeepWatch();
            }

        };

        /**
         * Import json to create app
         *
         * @param json
         */
        $scope.import = function(json) {

            json = JSON.parse(json);
            var name = $scope.view.toolForm.name;

            if ($scope.view.app.is_script) {
                delete json.script;
                delete json.adapter;
                delete json.requirements;
            }

            if (_.isString(json.adapter.baseCmd)) {
                json.adapter.baseCmd = [json.adapter.baseCmd];
            }

            Data.setTool(json);
            $scope.view.toolForm = Data.tool;

            if ($scope.view.mode === 'edit') {
                $scope.view.toolForm.name = name;
            }

            var job = angular.copy($scope.view.jobForm);
            job.inputs = {};

            Data.setJob(job);
            $scope.view.jobForm = Data.job;

            $scope.prepareForPagination(Data.tool.inputs.properties, 'values');

        };

        /**
         * Add item to the baseCmd
         */
        $scope.addBaseCmd = function () {
            $scope.view.toolForm.adapter.baseCmd.push('');
        };

        /**
         * Remove item from the baseCmd
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeBaseCmd = function (index) {
            if ($scope.view.toolForm.adapter.baseCmd.length === 1) {
                return false;
            }
            $scope.view.toolForm.adapter.baseCmd.splice(index, 1);
        };

        /**
         * Update baseCmd item if expression defined
         *
         * @param {integer} index
         * @param {*} value
         */
        $scope.updateBaseCmd = function (index, value) {
            $scope.view.toolForm.adapter.baseCmd[index] = value;
        };

        /**
         * Update stdout if expression or literal defined
         *
         * @param {*} value
         */
        $scope.updateStdOut = function (value) {
            $scope.view.toolForm.adapter.stdout = value;
        };

        /**
         * Update stdin if expression or literal defined
         *
         * @param {*} value
         */
        $scope.updateStdIn = function (value) {
            $scope.view.toolForm.adapter.stdin = value;
        };

        /**
         * Update tool resources and apply transformation on allocated resources if needed
         *
         * @param {*} value
         * @param {string} key
         */
        $scope.updateResource = function (value, key) {

            $scope.view.toolForm.requirements.resources[key] = value;

            if (_.isObject(value)) {

                SandBox.evaluate(value.$expr, {})
                    .then(function (result) {
                        $scope.view.jobForm.allocatedResources[key] = result;
                    }, function (error) {
                        console.log(error);
                    });
            } else {
                if ($scope.view.jobForm.allocatedResources[key] < value) {
                    $scope.view.jobForm.allocatedResources[key] = value;
                }
            }
        };

        /**
         * Set fresh structure for the cliche playground
         */
        $scope.flush = function() {

            $scope.view.loading = true;

            $scope.view.tab = 'general';

            $scope.view.page = {inputs: 1, outputs: 1, values: 1};
            $scope.view.total = {inputs: 0, outputs: 0, values: 0};
            $scope.view.pages = {values: []};

            var name = $scope.view.toolForm.name;

            Data.flush(name).then(function(result) {

                $scope.view.toolForm = angular.copy(result.tool);
                $scope.view.jobForm = angular.copy(result.job);
                $scope.view.command = '';

                if ($scope.view.user) {

                    $scope.view.toolForm.documentAuthor = $scope.view.user.email;
                }

                $scope.view.loading = false;

            });

        };

        /**
         * Redirect to the other page
         *
         * @param url
         */
        $scope.redirect = function(url) {

            BeforeRedirect.setReload(true);
            $location.path(url);

        };

        /**
         * Switch to another revision of the app
         */
        $scope.changeRevision = function() {

            Tool.getRevisions(0, '', $routeParams.id)
                .then(function(result) {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/revisions.html'),
                        controller: ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

                            $scope.view = data;

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };

                            $scope.choose = function(id) {
                                $modalInstance.close(id);
                            };

                        }],
                        windowClass: 'modal-revisions',
                        resolve: {data: function () {return {revisions: result.list, app: $scope.view.app, current: $scope.view.revision};}}
                    });

                    modalInstance.result.then(function (revisionId) {
                        $location.path('/cliche/' + $routeParams.type + '/' + $routeParams.id + '/' + revisionId);
                    });

                });

        };

        /**
         * Fork the current app
         */
        $scope.fork = function () {

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/dyole/pick-repo-name.html'),
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {repos: $scope.view.userRepos, type: 'save', pickName: true};}}

            });

            modalInstance.result.then(function(data) {

                $scope.view.saving = true;
                BeforeRedirect.setReload(true);

                data.is_script = $scope.view.app.is_script;

                Tool.fork(data).then(function (result) {
                    $location.path('/cliche/' + $routeParams.type + '/' + result.app._id + '/latest');
                }, function() {
                    $scope.view.saving = false;
                    BeforeRedirect.setReload(false);
                });

            });

        };

        /**
         * Create new tool
         *
         * @returns {boolean}
         */
        $scope.create = function() {

            if (_.isEmpty($scope.view.toolForm.name)) {

                $modal.open({
                    template: $templateCache.get('views/partials/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: ['You must enter name of the tool']}; }}
                });

                return false;
            }

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/dyole/pick-repo-name.html'),
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {repos: $scope.view.userRepos, type: 'save'};}}

            });

            modalInstance.result.then(function(data) {

                $scope.view.saving = true;

                data.is_script = $scope.view.app.is_script;

                Tool.create(data)
                    .then(function(result) {

                        $scope.view.saving = false;

                        var modalInstance = $modal.open({
                            template: $templateCache.get('views/cliche/partials/app-save-response.html'),
                            controller: 'ModalCtrl',
                            backdrop: 'static',
                            resolve: { data: function () { return { trace: result }; }}
                        });

                        modalInstance.result.then(function() {
                            $scope.redirect('/cliche/' + $routeParams.type + '/' + result.app._id + '/latest');
                        });

                    }, function () {
                        $scope.view.saving = false;
                    });

            });
        };

        /**
         * Update current revision
         *
         * @returns {boolean}
         */
        $scope.update = function() {

            $scope.view.saving = true;

            Tool.update($scope.view.app._id)
                .then(function(result) {

                    $scope.view.saving = false;

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/app-save-response.html'),
                        controller: 'ModalCtrl',
                        backdrop: 'static',
                        resolve: { data: function () { return { trace: result }; }}
                    });

                    modalInstance.result.then(function() {
                        $scope.redirect('/cliche/' + $routeParams.type + '/' + $scope.view.app._id + '/' + result.revision._id);
                    });

                }, function () {
                    $scope.view.saving = false;
                });

        };

        /**
         * Load json editor
         */
        $scope.loadJsonEditor = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/json-editor.html'),
                controller: 'JsonEditorCtrl',
                resolve: { options: function () { return {user: $scope.view.user}; }}
            });

            modalInstance.result.then(function (json) {
                $scope.import(json);
            });

        };

        /**
         * Delete app
         */
        $scope.delete = function () {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                $scope.view.saving = true;
                Tool.deleteRevision($scope.view.revision._id).then(function () {
                    $scope.view.saving = false;
                    BeforeRedirect.setReload(true);
                    $location.path('/apps');
                }, function() {
                    $scope.view.saving = false;
                });
            });

        };

        /**
         * Toggle dropdown menu
         */
        $scope.toggleMenu = function() {

            $scope.view.isMenuOpen = !$scope.view.isMenuOpen;

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
                resolve: {data: function () {return {markdown: $scope.view.toolForm.description};}}
            });

            modalInstance.result.then(function(result) {
                $scope.view.toolForm.description = result;
            });
        };


        var onBeforeUnloadOff = BeforeUnload.register(function() { return 'Please save your changes before leaving.'; });

        var onBeforeRedirectOff = BeforeRedirect.register(function () { return Data.save(); });

        $scope.$on('$destroy', function() {

            onBeforeUnloadOff();
            onBeforeUnloadOff = undefined;

            onBeforeRedirectOff();
            onBeforeRedirectOff = undefined;
        });


    }]);
