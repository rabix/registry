'use strict';

angular.module('clicheApp')
    .controller('HomeCtrl', ['$scope','$q', '$injector', 'Data', 'User', 'Loading', 'SandBox', function ($scope, $q, $injector, Data, User, Loading, SandBox) {

        $scope.view = {};
        $scope.forms = {};

        $scope.view.tab = 'general';
        $scope.view.trace = 'tool';
        $scope.view.showTrace = true;

        $scope.view.tabViewPath = 'views/tabs/general.html';

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

        $scope.view.classes = ['page', 'home', 'row'];
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

        $scope.$watch('$parent.view.fetch', function(doFetch) {
            if (doFetch) {

                $q.all([
                        Data.fetchTool(),
                        Data.fetchJob(),
                        Data.fetchOwner(),
                        Data.fetchAppId()
                    ]).then(function() {

                        $scope.view.toolForm = Data.tool;
                        $scope.view.toolForm.documentAuthor = null;

                        User.getUser().then(function(result) {
                            $scope.view.user = result.user;
                            if (result.user) {
                                $scope.view.toolForm.documentAuthor = result.user.email;
                                $scope.view.toolForm.softwareDescription.repo_owner = result.user.login;
                                //$scope.view.toolForm.softwareDescription.repo_name = '';
                            }
                        });

                        $scope.view.jobForm = Data.job;

                        $scope.view.owner = Data.owner;
                        $scope.view.appId = Data.appId;

                        $scope.view.loading = false;

                        /* add additional prop attributes */
                        _.each($scope.view.toolForm.inputs.properties, function(prop) {

                            if (_.isUndefined(prop.adapter.separator)) {
                                prop.adapter.separator = '_';
                            }
//                            if (_.isUndefined(prop.adapter.listSeparator)) {
//                                prop.adapter.listSeparator = 'repeat';
//                            }
                        });

                        /* add additional args attributes */
                        _.each($scope.view.toolForm.adapter.args, function(arg) {
                            if (_.isUndefined(arg.separator)) {
                                arg.separator = '_';
                            }
                        });

                    });

            }
        });


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
            $scope.view.tabViewPath = 'views/tabs/' + tab + '.html';

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

                if (_.isObject(resource) && resource.expr && _.contains(resource.expr, '$job')) {
                    SandBox.evaluate(resource.expr, {})
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
         * Toggle trace visibility
         */
        $scope.toggleTrace = function() {
            $scope.view.showTrace = !$scope.view.showTrace;

            if ($scope.view.showTrace) {
                if ($scope.view.trace === 'console') {
                    turnOnDeepWatch();
                }
            } else {
                if ($scope.view.trace === 'console') {
                    turnOffDeepWatch();
                }
            }
        };

        /**
         * Import existing app or app revision
         *
         * @param app
         */
        $scope.importApp = function(appObj) {

            var app = angular.copy(appObj);

            app.json.documentAuthor = $scope.view.user.email;
            app.json.softwareDescription.repo_owner = $scope.view.user.login;
            app.json.softwareDescription.repo_name = '';


            Data.setTool(app.json);
            $scope.view.toolForm = app.json;

            var job = angular.copy($scope.view.jobForm);
            job.inputs = {};

            Data.setJob(job);
            $scope.view.jobForm = job;

            Data.setOwner(app.user_id);
            $scope.view.owner = app.user_id;

            Data.setAppId(app._id);
            $scope.view.appId = app._id;

        };

        /**
         * Store the owner and the app id for the current app
         *
         * @param user_id
         * @param app_id
         */
        $scope.setOwnerAndAppId = function(user_id, app_id) {

            Data.setOwner(user_id);
            $scope.view.owner = user_id;

            Data.setAppId(app_id);
            $scope.view.appId = app_id;

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

                SandBox.evaluate(value.expr, {})
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

    }]);
