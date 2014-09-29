'use strict';

angular.module('clicheApp')
    .controller('HomeCtrl', ['$scope','$q', '$injector', 'Data', 'User', 'Loading', function ($scope, $q, $injector, Data, User, Loading) {

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

        $scope.view.valuesFrom = {};

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
                        Data.fetchAppId(),
                        Data.fetchExpressions()
                    ]).then(function() {

                        $scope.view.toolForm = Data.tool;
                        $scope.view.toolForm.documentAuthor = null;

                        User.getUser().then(function(result) {
                            $scope.view.user = result.user;
                            if (result.user) {
                                $scope.view.toolForm.documentAuthor = result.user.email;
                                $scope.view.toolForm.softwareDescription.repo_owner = result.user.login;
//                                $scope.view.toolForm.softwareDescription.repo_name = '';
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

                        /* prepare transforms */
                        $scope.view.transforms = {
                            'transforms/strip_ext': false,
                            'transforms/m-suffix': false
                        };
                        _.each($scope.view.toolForm.requirements.platformFeatures, function(transform) {
                            $scope.view.transforms[transform] = true;
                        });

                        /* generate valuesFrom array */
                        _.each($scope.view.jobForm.allocatedResources, function(value, key) {

                            $scope.view.valuesFrom['#allocatedResources/' + key] = value;

                            $scope.$watch('view.toolForm.requirements.resources.'+key, function(newVal, oldVal) {
                                if (newVal !== oldVal) {
                                    $scope.view.jobForm.allocatedResources[key] = newVal;
                                    $scope.view.valuesFrom['#allocatedResources/' + key] = newVal;
                                }
                            });
                        });


                        /* add additional args attributes */
                        _.each($scope.view.toolForm.adapter.args, function(arg) {
                            if (_.isUndefined(arg.separator)) {
                                arg.separator = '_';
                            }
                            if (!_.isUndefined(arg.valueFrom)) {
                                arg.value = $scope.view.valuesFrom[arg.valueFrom];
                            }
                        });

                    });

            }
        });

        /**
         * Toggle transforms list
         * @param transform
         */
        $scope.toggleTransformsList = function(transform) {

            if (_.contains($scope.view.toolForm.requirements.platformFeatures, transform)) {
                _.remove($scope.view.toolForm.requirements.platformFeatures, function(transformStr) {
                    return transform === transformStr;
                });
            } else {
                $scope.view.toolForm.requirements.platformFeatures.push(transform);
            }
        };


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
        };

        /* watchers list */
        var watchers = [];

        /**
         * Turn on deep watch when console tab is visible
         */
        var turnOnDeepWatch = function() {

//            $scope.view.command = Data.generateCommand();
            Data.generateCommand()
                .then(function (command) {
                    $scope.view.command = command;
                });

            var watch = ['view.jobForm.inputs', 'view.toolForm.inputs.properties', 'view.toolForm.adapter'];

            _.each(watch, function(arg) {
                var watcher = $scope.$watch(arg, function(n, o) {
                    if (n !== o) {
//                        $scope.view.command = Data.generateCommand();
                        Data.generateCommand()
                            .then(function (command) {
                                $scope.view.command = command;
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

        $scope.editExpression = function (namespace, index) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');
            var suffix = _.isUndefined(index) ? '' : index;

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/edit-expression.html'),
                controller: 'ExpressionCtrl',
                windowClass: 'modal-expression',
                resolve: {
                    options: function () {
                        return {
                            name: namespace + suffix,
                            namespace: namespace + suffix,
                            type: 'adapter',
                            self: false
                        };
                    }
                }
            });

            modalInstance.result.then(function (code) {

                var SandBox = $injector.get('SandBox');

                SandBox.evaluate(code, {})
                    .then(function (result) {

                        if (_.isUndefined(index)) {
                            $scope.view.toolForm.adapter[namespace] = result;
                        } else {
                            //I know, this is ugly but easiest way to initiate scope update without forcing deep watch
                            var copy = angular.copy($scope.view.toolForm.adapter[namespace]);
                            copy[index] = result;

                            $scope.view.toolForm.adapter[namespace] = [];
                            $scope.view.toolForm.adapter[namespace] = angular.copy(copy);
                        }
                    });

            });

        };

    }]);
