/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:00 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .controller('ClicheCtrl', ['$scope', '$q', '$stateParams', '$modal', '$templateCache', '$state', '$rootScope', 'User', 'Repo', 'Tool', 'Cliche', 'Sidebar', 'Loading', 'SandBox', 'BeforeUnload', 'BeforeRedirect', function($scope, $q, $stateParams, $modal, $templateCache, $state, $rootScope, User, Repo, Tool, Cliche, Sidebar, Loading, SandBox, BeforeUnload, BeforeRedirect) {

        $scope.Loading = Loading;

        Sidebar.setActive($stateParams.type + ' editor');

        var cliAdapterWatchers = [],
            jobWatcher,
            onBeforeUnloadOff = BeforeUnload.register(function() { return 'Please save your changes before leaving.'; }),
            onBeforeRedirectOff = BeforeRedirect.register(function () { return Cliche.save($scope.view.mode); }),
            reqMap = {CpuRequirement: 'cpu', MemRequirement: 'mem'};

        $scope.view = {};
        $scope.form = {};

        /* form holders, for validation only */
        $scope.form.tool = {};
        $scope.form.job = {};

        /* tool schema holder and job json for testing */
        $scope.view.tool = {};
        $scope.view.job = {};

        /* actual tool app from db */
        $scope.view.app = {is_script: $stateParams.type === 'script'};
        /* actual tool app revision from db */
        $scope.view.revision = {};

        /* loading flag */
        $scope.view.loading = true;

        /* cliche mode: new or edit */
        $scope.view.mode = $stateParams.id ? 'edit' : 'new';

        /* menu visibility flag */
        $scope.view.isMenuVisible = false;

        /* console visibility flag */
        $scope.view.isConsoleVisible = false;

        /* current tab - available: general, inputs, outputs, adapter, test */
        $scope.view.tab = 'general';

        /* tool type: tool or script */
        $scope.view.type = $stateParams.type;

        /* page classes */
        $scope.view.classes = ['page', 'cliche'];

        /* command line generator error */
        $scope.view.cmdError = '';

        /* generating command flag */
        $scope.view.generatingCommand = false;

        /* list of user repos */
        $scope.view.repos = [];

        /* current user */
        $scope.view.user = null;

        Loading.setClasses($scope.view.classes);

        Cliche.subscribe(function(cmd) {
            $scope.view.command = cmd;
        });

        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Cliche.checkVersion()
            .then(function() {

                $q.all([
                        ($stateParams.id ? Tool.getTool($stateParams.id, $stateParams.revision) : Cliche.fetchLocalToolAndJob($stateParams.type)),
                        User.getUser(),
                        Repo.getRepos(0, '', true)
                    ])
                    .then(function(result) {

                        $scope.view.loading = false;

                        if ($stateParams.id) {
                            $scope.view.app = result[0].data;
                            $scope.view.revision = result[0].revision;

                            Cliche.setTool($scope.view.revision.json);
                            Cliche.setJob($scope.view.revision.job ? JSON.parse($scope.view.revision.job) : null);
                        }

                        $scope.view.user = result[1].user;
                        $scope.view.repos = result[2].list;

                        setUpCliche();
                        prepareRequirements();

                        $scope.toggleConsole();

                    });

            });

        /**
         * Set up cliche form
         */
        var setUpCliche = function() {

            $scope.view.command = '';

            $scope.view.tool = Cliche.getTool();
            $scope.view.job = Cliche.getJob();

            if ($scope.view.user && $scope.view.mode === 'new') {
                $scope.view.tool.owner = [$scope.view.user.email];
            }
        };

        /**
         * Output error message if something was wrong with expressions evaluation
         */
        var outputError = function () {

            $scope.view.generatingCommand = false;
            $scope.view.command = '';
            $scope.view.cmdError = 'There are some errors in some of your expressions';

        };

        /**
         * Output command generated from the form
         *
         * @param {string} command
         */
        var outputCommand = function (command) {

            $scope.view.generatingCommand = false;
            $scope.view.command = command;
            $scope.view.cmdError = '';

        };

        /**
         * Turn on cliAdapter deep watch when console visible
         */
        var turnOnCliAdapterDeepWatch = function() {

            if ($stateParams.type === 'tool') {

                $scope.view.generatingCommand = true;
                Cliche.generateCommand()
                    .then(outputCommand, outputError);

                var watch = [
                    'view.tool.cliAdapter.baseCmd',
                    'view.tool.cliAdapter.stdout',
                    'view.tool.cliAdapter.stdin'
                ];

                _.each(watch, function(arg) {
                    var watcher = $scope.$watch(arg, function(n, o) {
                        if (n !== o) {
                            $scope.view.generatingCommand = true;
                            Cliche.generateCommand()
                                .then(outputCommand, outputError);
                        }
                    }, true);
                    cliAdapterWatchers.push(watcher);
                });
            }

        };

        /**
         * Turn off cliAdapter deep watch when console tab is hidden
         */
        var turnOffCliAdapterDeepWatch = function() {

            _.each(cliAdapterWatchers, function(watcher) {
                if (_.isFunction(watcher)) { watcher.call(); }
            });

            cliAdapterWatchers = [];
        };

        /**
         * Split requirements in separate objects in order to use them directly
         */
        var prepareRequirements = function() {

            $scope.view.reqDockerCnt = _.find($scope.view.tool.requirements, {'@type': 'DockerCnt'});
            $scope.view.reqCpuRequirement = _.find($scope.view.tool.requirements, {'@type': 'CpuRequirement'});
            $scope.view.reqMemRequirement = _.find($scope.view.tool.requirements, {'@type': 'MemRequirement'});

        };

        /**
         * Check if there are expressions applied on cpu and mem requirements and evaluate
         * them in order to refresh result for the allocated resources
         */
        var checkRequirements = function () {

            var req;

            _.each(reqMap, function (key, reqName) {
                req = $scope.view['req' + reqName];
                if (req.value && _.isObject(req.value) && _.contains(req.value.value, '$job')) {
                    SandBox.evaluate(req.value.value, {})
                        .then(function (result) {
                            $scope.view.job.allocatedResources[key] = result;
                        });
                }
            });
        };

        /**
         * Watch the job's inputs in order to evaluate
         * expression which include $job as context
         */
        var turnOnJobDeepWatch = function() {

            if ($stateParams.type === 'tool') {

                checkRequirements();

                if ($scope.view.isConsoleVisible) {
                    $scope.view.generatingCommand = true;
                    Cliche.generateCommand()
                        .then(outputCommand, outputError);
                }

                jobWatcher = $scope.$watch('view.job.inputs', function(n, o) {
                    if (n !== o) {
                        checkRequirements();
                        if ($scope.view.isConsoleVisible) {
                            $scope.view.generatingCommand = true;
                            Cliche.generateCommand()
                                .then(outputCommand, outputError);
                        }
                    }
                }, true);

            }

        };

        /**
         * Unwatch job's inputs
         */
        var turnOffJobDeepWatch = function() {

            if (_.isFunction(jobWatcher)) {
                jobWatcher.call();
                jobWatcher = null;
            }

        };

        /**
         * Import external tool
         *
         * @param {Object} json
         */
        var importTool = function(json) {

            json = JSON.parse(json);

            var preserve = $scope.view.mode === 'new';

            var cachedName = $scope.view.tool.label;

            if (angular.isDefined(json.cliAdapter) && angular.isString(json.cliAdapter.baseCmd)) {
                json.cliAdapter.baseCmd = [json.cliAdapter.baseCmd];
            }

            if ($stateParams.type === 'script') {

                json.transform = Cliche.getTransformSchema();
                delete json.cliAdapter;
                delete json.requirements;

            } else {
                if (angular.isDefined(json.transform)) { delete json.transform; }
            }

            Cliche.setTool(json, preserve);
            $scope.view.tool = Cliche.getTool();

            if ($scope.view.mode === 'edit') { $scope.view.tool.label = cachedName; }

            Cliche.setJob(null, preserve);
            $scope.view.job = Cliche.getJob();

            prepareRequirements();

        };

        /**
         * Redirect to the other page
         *
         * @param url
         */
        var redirectTo = function(state, params) {

            params = params || {};

            BeforeRedirect.setReload(true);
            $state.go(state, params);

        };

        /**
         * Switch the tab
         * @param tab
         */
        $scope.switchTab = function(tab) {
            $scope.view.tab = tab;

            if (tab === 'test') {
                turnOnJobDeepWatch();
            } else {
                turnOffJobDeepWatch();
            }

        };

        /**
         * Set fresh structure for the cliche playground
         */
        $scope.flush = function() {

            var modalInstance = $modal.open({
                controller: 'ModalCtrl',
                template: $templateCache.get('views/partials/confirm-delete.html'),
                resolve: { data: function () {
                    return {
                        message: 'Are you sure you want to delete this ' + $scope.view.type + '?'
                    }; }}
            });

            modalInstance.result.then(function () {
                var preserve = $scope.view.mode === 'new';

                $scope.view.loading = true;

                $scope.view.tab = 'general';

                var cachedName = $scope.view.tool.label;

                Cliche.flush(preserve, $stateParams.type, cachedName)
                    .then(function() {

                        $scope.view.loading = false;

                        setUpCliche();
                        prepareRequirements();

                    });

            }, function () {
                return false;
            });

        };

        /**
         * Load json editor
         */
        $scope.loadJsonEditor = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/json-editor.html'),
                controller: 'JsonEditorCtrl',
                resolve: { options: function () { return {user: $scope.view.user, type: $stateParams.type}; }}
            });

            modalInstance.result.then(function (json) {
                importTool(json);
            });

            return modalInstance;

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
                resolve: {data: function () {return {markdown: $scope.view.tool.description};}}
            });

            modalInstance.result.then(function(result) {
                $scope.view.tool.description = result;
            });

            return modalInstance;
        };

        /**
         * Sorts inputs/args by position
         * @param item
         * @returns {*}
         */
        $scope.sortByPosition = function(item) {

            var position = item.adapter && item.adapter.position ? item.adapter.position : 0; //input
            position = item.position ? item.position : position; //args

            return position;
        };


        /**
         * Toggle dropdown menu
         */
        $scope.toggleMenu = function() {

            $scope.view.isMenuVisible = !$scope.view.isMenuVisible;

        };

        /**
         * Toggle console visibility
         */
        $scope.toggleConsole = function() {

            $scope.view.isConsoleVisible = !$scope.view.isConsoleVisible;

            if ($scope.view.isConsoleVisible) {
                turnOnCliAdapterDeepWatch();
            } else {
                turnOffCliAdapterDeepWatch();
            }

        };

        /**
         * Initiate command generating
         */
        $scope.generateCommand = function() {
            Cliche.generateCommand();
        };

        /**
         * Update tool resources and apply transformation on allocated resources if needed
         *
         * @param {*} transform
         * @param {string} key
         */
        $scope.updateResource = function (transform, key) {

            var req = $scope.view['req' + key];

            req.value = transform;

            if (_.isObject(transform)) {

                SandBox.evaluate(transform.value, {})
                    .then(function (result) {
                        $scope.view.job.allocatedResources[reqMap[key]] = result;
                    });

            } else {
                if ($scope.view.job.allocatedResources[reqMap[key]] < transform) {
                    $scope.view.job.allocatedResources[reqMap[key]] = transform;
                }
            }

        };

        /**
         * Update value from the cliAdapter
         * @param value
         * @param index
         * @param key
         */
        $scope.updateCliAdapter = function (value, index, key) {
            value = angular.copy(value);

            if (index) {
                $scope.view.tool.cliAdapter[key][index] = value;
            } else {
                $scope.view.tool.cliAdapter[key] = value;
            }

        };

        /**
         * Add item to the baseCmd
         */
        $scope.addBaseCmd = function () {

            $scope.view.tool.cliAdapter.baseCmd.push('');

        };

        /**
         * Remove item from the baseCmd
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeBaseCmd = function (index) {

            if ($scope.view.tool.cliAdapter.baseCmd.length === 1) { return false; }

            $scope.view.tool.cliAdapter.baseCmd.splice(index, 1);
        };

        /**
         * Create new tool and default revision
         *
         * @returns {boolean}
         */
        $scope.createTool = function() {

            var modalInstance;

            if ($scope.form.tool.label.$invalid) {
                modalInstance = $modal.open({
                    template: $templateCache.get('views/partials/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: ['You must enter valid name (avoid characters \'$\' and \'.\')']}; }}
                });

                return modalInstance;
            }

            modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/repo/pick-repo-name.html'),
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {repos: $scope.view.repos, type: 'save'};}}

            });

            modalInstance.result.then(function(data) {

                $scope.view.loading = true;

                var repoId = data.repoId,
                    tool = Cliche.getTool(),
                    job = Cliche.getJob();

                Tool.create(repoId, tool, job, $stateParams.type)
                    .then(function(result) {

                        $scope.view.loading = false;

                        var modalInstance = $modal.open({
                            template: $templateCache.get('views/cliche/partials/app-save-response.html'),
                            controller: 'ModalCtrl',
                            backdrop: 'static',
                            resolve: { data: function () { return { trace: result }; }}
                        });

                        modalInstance.result.then(function() {
                            redirectTo('cliche-edit', {type: $stateParams.type, id: result.app._id, revision: 'latest'});
                        });

                    }, function (error) {
                        $scope.view.loading = false;
                        $rootScope.$broadcast('httpError', {message: error});
                    });
            });

        };

        /**
         * Update current tool
         *
         * @returns {boolean}
         */
        $scope.updateTool = function() {

            var deferred = $q.defer();

            $scope.view.loading = true;

            var appId = $scope.view.app._id,
                tool = Cliche.getTool(),
                job = Cliche.getJob();

            Tool.update(appId, tool, job, $stateParams.type)
                .then(function(result) {

                    $scope.view.loading = false;

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/app-save-response.html'),
                        controller: 'ModalCtrl',
                        backdrop: 'static',
                        resolve: { data: function () { return { trace: result }; }}
                    });

                    modalInstance.result.then(function() {
                        redirectTo('cliche-edit', {type: $stateParams.type, id: $scope.view.app._id, revision: result.revision._id});
                    });

                    deferred.resolve(modalInstance);

                }, function (error) {
                    $scope.view.loading = false;
                    $rootScope.$broadcast('httpError', {message: error});
                    deferred.reject();
                });

            return deferred.promise;

        };

        /**
         * Fork the current tool
         */
        $scope.forkTool = function () {

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/repo/pick-repo-name.html'),
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {repos: $scope.view.repos, type: 'save', pickName: true};}}

            });

            modalInstance.result.then(function(data) {

                $scope.view.loading = true;

                var repoId = data.repoId,
                    name = data.name,
                    tool = Cliche.getTool(),
                    job = Cliche.getJob();

                Tool.fork(repoId, name, tool, job, $stateParams.type).then(function (result) {

                    $scope.view.loading = false;

                    redirectTo('cliche-edit', {type: $stateParams.type, id: result.app._id, revision: 'latest'});

                }, function(error) {
                    $scope.view.loading = false;
                    $rootScope.$broadcast('httpError', {json: error});
                });

            });

            return modalInstance;

        };

        /**
         * Delete tool revision
         */
        $scope.deleteRevision = function () {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {

                $scope.view.loading = true;

                Tool.deleteRevision($scope.view.revision._id).then(function () {

                    $scope.view.loading = false;

                    redirectTo('apps');

                }, function() {
                    $scope.view.loading = false;
                });
            });

            return modalInstance;

        };

        /**
         * Switch to another revision of the app
         */
        $scope.changeRevision = function() {

            var deferred = $q.defer();

            Tool.getRevisions(0, '', $stateParams.id)
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
                        size: 'sm',
                        windowClass: 'modal-revisions',
                        resolve: {data: function () {return {revisions: result.list, app: $scope.view.app, current: $scope.view.revision};}}
                    });

                    modalInstance.result.then(function (revisionId) {
                        $state.go('cliche-edit', {type: $stateParams.type, id: $stateParams.id, revision: revisionId});
                    });

                    deferred.resolve(modalInstance);

                });

            return deferred.promise;

        };

        $scope.$on('$destroy', function() {

            onBeforeUnloadOff();
            onBeforeUnloadOff = undefined;

            onBeforeRedirectOff();
            onBeforeRedirectOff = undefined;
        });

    }]);
