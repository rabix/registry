/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:00 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .controller('ClicheCtrl', ['$parse', '$scope', '$q', '$stateParams', '$modal', '$templateCache', '$state', '$rootScope', 'User', 'Repo', 'Tool', 'Cliche', 'Sidebar', 'Loading', 'SandBox', 'BeforeUnload', 'BeforeRedirect', 'HelpMessages', 'HotkeyRegistry', 'Chronicle', 'Notification', function($parse, $scope, $q, $stateParams, $modal, $templateCache, $state, $rootScope, User, Repo, Tool, Cliche, Sidebar, Loading, SandBox, BeforeUnload, BeforeRedirect, HelpMessages, HotkeyRegistry, Chronicle, Notification) {

        $scope.Loading = Loading;

        Sidebar.setActive($stateParams.type + ' editor');

        var cliAdapterWatchers = [],
            jobWatcher,
            //onBeforeUnloadOff = BeforeUnload.register(function() { return 'Please save your changes before leaving.'; }),
            onBeforeUnloadOff = BeforeUnload.register(
                function () { return 'Please save your changes before leaving.'; },
                function () { return $scope.form.tool.$dirty; }
            ),
            onBeforeRedirectOff = BeforeRedirect.register(
                function () { return Cliche.save($scope.view.mode); },
                function () { return $scope.form.tool.$dirty; }
            ),
            reqMap = {CPURequirement: 'cpu', MemRequirement: 'mem'};

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

        /* tool type: tool or script */
        $scope.view.type = $stateParams.type;

        /* current tab - available: general, inputs, outputs, metadata, test, script */
        $scope.view.tab = $scope.view.type === 'script' ? 'script' : 'general';

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

        /* categories */
        $scope.view.categories = [];

        /* help messages */
        $scope.help = HelpMessages;

        /* cpu options */
        $scope.view.cpuOptions = [
            {
                key: 0,
                value: 'Single-Threaded'
            },
            {
                key: 1,
                value: 'Multi-Threaded'
            }
        ];

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
                        setUpCategories();
                        prepareStatusCodes();

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
                    'view.tool.baseCommand',
                    'view.tool.stdout',
                    'view.tool.stdin'
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

            $scope.view.reqDockerRequirement = _.find($scope.view.tool.requirements, {'class': 'DockerRequirement'});
            $scope.view.reqCPURequirement = _.find($scope.view.tool.requirements, {'class': 'CPURequirement'});
            $scope.view.reqMemRequirement = _.find($scope.view.tool.requirements, {'class': 'MemRequirement'});

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
                    SandBox.evaluate(req.value.script, {})
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

            if (angular.isDefined(json) && angular.isString(json.baseCommand)) {
                json.baseCmd = [json.baseCmd];
            }

            if ($stateParams.type === 'script') {

                json.enginge = Cliche.getTransformSchema().engine;
                delete json.baseCommand;
                delete json.stdin;
                delete json.stdout;
                delete json.argAdapters;
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
            setUpCategories();

        };

        /**
         * Redirect to the other page
         *
         * @param state
         * @param param
         */
        var redirectTo = function(state, params) {

            params = params || {};

            BeforeRedirect.setReload(true);
            BeforeRedirect.setPrompt(false);
            $state.go(state, params);

        };

        /**
         * Prepares categories for tagsInput directive
         */
        var setUpCategories = function() {
            $scope.view.categories = _.map($scope.view.tool['sbg:category'], function(cat) {

                return {text: cat};
            });
        };

        var prepareStatusCodes = function () {
            if (typeof $scope.view.tool.successCodes === 'undefined') {
                $scope.view.tool.successCodes = [];
            }

            if (typeof $scope.view.tool.temporaryFailCodes === 'undefined') {
                $scope.view.tool.temporaryFailCodes = [];
            }
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

        $scope.view.stdinInput = Cliche.getStdinInput();
        $scope.view.stdinUsed = !!$scope.view.stdinInput;

        $scope.$watch(Cliche.getStdinInput, function(n) {
            $scope.view.stdinUsed = !!n;
            $scope.view.stdinInput = n;
        });


        /**
         * Toggle markdown preview
         */
        $scope.togglePreview = function() {
            $scope.view.preview = !$scope.view.preview;
        };

        /**
         * Set fresh structure for the cliche playground
         */
        $scope.flush = function() {

            var modalInstance = $modal.open({
                controller: 'ModalCtrl',
                template: $templateCache.get('modules/common/views/confirm-delete.html'),
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
                        setUpCategories();

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
                template: $templateCache.get('modules/cliche/views/partials/json-editor.html'),
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
                template: $templateCache.get('modules/common/views/markdown.html'),
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

            var position = item.inputBinding && item.inputBinding.position ? item.inputBinding.position : 0; //input
            position = item.position ? item.position : position; //args

            return position;
        };

        /**
         * Updates $scope.view.tool.categories
         */
        $scope.updateCategories = function() {
            $scope.view.tool['sbg:category'] = _.pluck($scope.view.categories, 'text');
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

            var req = $scope.view['req' + key] || { class: key };

            req.value = transform;

            if (_.isObject(transform)) {

                SandBox.evaluate(transform.script, {})
                    .then(function (result) {
                        $scope.view.job.allocatedResources[reqMap[key]] = result;
                    });

            } else {
                $scope.view.job.allocatedResources[reqMap[key]] = transform;
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
                $scope.view.tool[key][index] = value;
            } else {
                $scope.view.tool[key] = value;
            }

        };

        $scope.addStatusCode = function (codeType) {

            if ( _.isArray($scope.view.tool[codeType]) ) {
                $scope.view.tool[codeType].push(0);
            } else {
                console.error('Invalid status code key passed');
                return false;
            }

        };

        /**
         * Remove item from the status codes
         *
         * @param {string} type
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeStatusCode = function (type,  index) {

            if ( !_.isArray($scope.view.tool[type]) ) {
                console.error('Invalid status code key passed');
                return false;
            }

            $scope.view.tool[type].splice(index, 1);
        };


        /**
         * Add item to the baseCommand
         */
        $scope.addBaseCmd = function () {

            $scope.view.tool.baseCommand.push('');

        };

        /**
         * Remove item from the baseCommand
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeBaseCmd = function (index) {

            if ($scope.view.tool.baseCommand.length === 1) { return false; }

            $scope.view.tool.baseCommand.splice(index, 1);
        };

        /**
         * Splits single base command into multiple
         *
         * @param value
         * @param index
         */
        $scope.splitBaseCmd = function (value, index) {
            value = value.replace(/\s+/g, ' ');

            var baseCommands = value.split(' ');
            var adapterBaseCmd = $scope.view.tool.baseCommand;

            if (baseCommands.length > 0) {
                adapterBaseCmd.splice(index, 1);

                _.forEach(baseCommands, function(cmd, key) {
                    adapterBaseCmd.splice(parseInt(index, 10) + key, 0, cmd);
                });

                if(!$scope.$$phase) {
                    $scope.$apply();
                    Cliche.generateCommand();
                }
            }
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
                    template: $templateCache.get('modules/common/views/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: ['You must enter valid name (avoid characters \'$\' and \'.\')']}; }}
                });

                return modalInstance;
            }

            modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('modules/repo/views/pick-repo-name.html'),
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
                            template: $templateCache.get('modules/cliche/views/partials/app-save-response.html'),
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
                        template: $templateCache.get('modules/cliche/views/partials/app-save-response.html'),
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
                template: $templateCache.get('modules/repo/views/pick-repo-name.html'),
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
                template: $templateCache.get('modules/common/views/confirm-delete.html'),
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
                        template: $templateCache.get('modules/cliche/views/partials/revisions.html'),
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

        function reInitCliche() {
            Cliche.setTool($scope.view.tool);
            setUpCliche();
            prepareRequirements();
            setUpCategories();
            Cliche.generateCommand()
                .then(outputCommand, outputError);
        }

        /**
         * Undo previous action
         */
        $scope.undoAction = function () {
            if ($scope.view.canUndo()) {
                $scope.chron.undo();
                reInitCliche();
                Notification.primary({message: 'Undoing', delay: 500});
            } else {
                Notification.warning({message: 'No more actions to undo. End of history queue.', delay: 1000});
            }
        };

        $scope.redoAction = function () {
            if ($scope.view.canRedo()) {
                $scope.chron.redo();
                reInitCliche();
                Notification.primary({message: 'Redoing', delay: 500});
            } else {
                Notification.warning({message: 'No more actions to redo', delay: 1000});
            }
        };

        var unloadHotkeys = HotkeyRegistry.loadHotkeys([
            {name: 'save', callback: $scope.view.mode === 'edit' ? $scope.updateTool : $scope.createTool, preventDefault: true},
            {name: 'undo', callback: $scope.undoAction, preventDefault: true, allowIn: ['INPUT', 'SELECT', 'TEXTAREA']},
            {name: 'redo', callback: $scope.redoAction, preventDefault: true, allowIn: ['INPUT', 'SELECT', 'TEXTAREA']}
        ]);
        
        $scope.chron = Chronicle.record('view.tool', $scope, true);

        $scope.view.canUndo = function () {
            return $scope.chron ? $scope.chron.currArchivePos > 1 : false;
        };
        $scope.view.canRedo = function () {
            return $scope.chron ? $scope.chron.currArchivePos !== $scope.chron.archive.length - 1 : false;
        };

        $scope.$on('$destroy', function() {

            unloadHotkeys();

            onBeforeUnloadOff();
            onBeforeUnloadOff = undefined;

            onBeforeRedirectOff();
            onBeforeRedirectOff = undefined;
        });

    }]);
