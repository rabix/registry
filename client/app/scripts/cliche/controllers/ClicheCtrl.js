/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ClicheCtrl', ['$scope', '$rootScope', '$q', '$injector', '$routeParams', '$location', 'Data', 'User', 'App', 'Loading', 'SandBox', 'Sidebar', function ($scope, $rootScope, $q, $injector, $routeParams, $location, Data, User, App, Loading, SandBox, Sidebar) {

        Sidebar.setActive('cliche');

        $scope.view = {};
        $scope.forms = {};

        $scope.view.tab = 'general';
        $scope.view.trace = 'tool';
        $scope.view.saving = false;
        $scope.view.reload = false;
        $scope.view.app = {};

        /* cliche mode: new or edit */
        $scope.view.mode = $routeParams.id ? 'edit' : 'new';

        $scope.view.tabViewPath = 'views/cliche/tabs/general.html';

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

        if ($routeParams.id) {

            $q.all([
                    App.getApp($routeParams.id, $routeParams.revision),
                    User.getUser()
                ]).then(function(result) {

                    $scope.view.loading = false;

                    $scope.view.app = result[0].data;
                    $scope.view.currentRevision = result[0].revision;
                    $scope.view.user = result[1].user;

                    Data.setTool($scope.view.app.json);
                    $scope.view.toolForm = Data.tool;

                    Data.setJob();
                    $scope.view.jobForm = Data.job;

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

                        $scope.view.toolForm = Data.tool;
                        if ($scope.view.user) {
                            $scope.view.toolForm.documentAuthor = $scope.view.user.email;
                            $scope.view.toolForm.softwareDescription.repo_owner = $scope.view.user.login;
                        }

                        $scope.view.jobForm = Data.job;

                    });
            });

        }

        /**
         * Toggle properties visibility (expand/collapse)
         * @param {string} tab
         */
        $scope.toggleProperties = function(tab) {

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
            $scope.view.tabViewPath = 'views/cliche/tabs/' + tab + '.html';

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

            $scope.view.generatingCommand = true;
            Data.generateCommand()
                .then(function (command) {
                    $scope.view.command = command;
                    $scope.view.generatingCommand = false;
                });

            //var watch = ['view.jobForm.inputs', 'view.toolForm.inputs.properties', 'view.toolForm.adapter'];
            var watch = ['view.toolForm.inputs.properties', 'view.toolForm.adapter'];

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

        };

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
         * Check if there are expressions applied on resources and evaluate them in order to refresh result for the allocated resources
         */
        var checkResources = function () {

            _.each($scope.view.toolForm.requirements.resources, function (resource, key) {

                if (_.isObject(resource) && resource.expr && _.contains(resource.expr.value, '$job')) {
                    SandBox.evaluate(resource.expr.value, {})
                        .then(function (result) {
                            $scope.view.jobForm.allocatedResources[key] = result;
                        }, function (error) {
                            console.log(error);
                        });
                }
            });
        };

        /**
         * Watch the job's inputs in order to evaluate expression which include $job as context
         */
        var watchTheJob = function () {

            checkResources();

            if ($scope.view.trace === 'console') {
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
                    if ($scope.view.trace === 'console') {
                        $scope.view.generatingCommand = true;
                        Data.generateCommand()
                            .then(function (command) {
                                $scope.view.command = command;
                                $scope.view.generatingCommand = false;
                            });
                    }
                }
            }, true);

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
         * Switch the trace tab
         * @param tab
         */
        $scope.switchTrace = function(tab) {

            $scope.view.trace = tab;

            if (tab === 'console') {
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

            Data.setTool(json);
            $scope.view.toolForm = json;

            var job = angular.copy($scope.view.jobForm);
            job.inputs = {};

            Data.setJob(job);
            $scope.view.jobForm = job;

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
         * Update tool resources and apply transformation on allocated resources if needed
         *
         * @param {*} value
         * @param {string} key
         */
        $scope.updateResource = function (value, key) {

            $scope.view.toolForm.requirements.resources[key] = value;

            if (_.isObject(value)) {

                SandBox.evaluate(value.expr.value, {})
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

            Data.flush().then(function(result) {

                $scope.view.toolForm = result.tool;
                $scope.view.jobForm = result.job;
                $scope.view.command = '';

                if ($scope.view.user) {

                    $scope.view.toolForm.documentAuthor = $scope.view.user.email;
                    $scope.view.toolForm.softwareDescription.repo_owner = $scope.view.user.login;
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

            $scope.view.reload = true;
            $location.path(url);

        };

        /**
         * Switch to another revision of the app
         */
        $scope.changeRevision = function() {

            App.getRevisions(0, '', $routeParams.id)
                .then(function(result) {

                    var $modal = $injector.get('$modal');
                    var $templateCache = $injector.get('$templateCache');

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/revisions.html'),
                        controller: ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

                            $scope.view = data;

                            $scope.view.versions = _.times($scope.view.revisions.length).reverse();

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };

                            $scope.choose = function(id) {
                                $modalInstance.close(id);
                            };

                        }],
                        windowClass: 'modal-revisions',
                        resolve: {data: function () {return {revisions: result.list, app: $scope.view.app, current: $scope.view.currentRevision};}}
                    });

                    modalInstance.result.then(function (revisionId) {
                        $scope.view.reload = true;
                        $location.path('/cliche/' + $routeParams.id + '/' + revisionId);
                    });

                });

        };

        /**
         * Fork the current app
         */
        $scope.fork = function () {

            $scope.view.saving = true;

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-fork.html'),
                controller: 'ModalCtrl',
                resolve: { data: function () { return {message: 'Are you sure you want to fork this app?'}; }}
            });

            modalInstance.result.then(function () {
                $scope.view.reload = true;

                App.fork().then(function (result) {
                    $location.path('/cliche/' + result.app._id + '/latest');
                });

            });

        };

        /**
         * Track route change in order to prevent loss of changes
         *
         * @param e
         * @param nextLocation
         */
        var onRouteChange = function(e, nextLocation) {

            if($scope.view.reload) { return; }

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-leave.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () {return {};}}
            });

            modalInstance.result.then(function () {

                onRouteChangeOff();

                $scope.view.reload = true;

                Data.save()
                    .then(function() {
                        $location.path(nextLocation.split('#\/')[1]);
                    });
            });

            e.preventDefault();

        };

        var onRouteChangeOff = $rootScope.$on('$locationChangeStart', onRouteChange);




    }]);
