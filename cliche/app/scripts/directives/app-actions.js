'use strict';

angular.module('clicheApp')
    .directive('appActions', ['$templateCache', '$modal', '$timeout', 'App', 'Data', function ($templateCache, $modal, $timeout, App, Data) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/app-actions.html'),
            scope: {
                form: '=',
                user: '=',
                handle: '&'
            },
            link: function(scope) {

                var timeoutId;

                scope.view = {};
                scope.view.saving = false;

                scope.Data = Data;

                scope.savePermissions = function() {
                    if (scope.user.id === Data.owner && Data.appId) {
                        scope.view.canSave = true;
                    } else {
                        scope.view.canSave = false;
                    }
                };

                scope.savePermissions();

                scope.$watch('Data.appId', function(newAppId, oldAppId) {
                    if (newAppId !== oldAppId) {
                        scope.savePermissions();
                    }
                });

                /**
                 * Publish the app to the registry
                 */
                scope.publishApp = function() {

                    if (scope.form.$invalid) {
                        scope.form.$setDirty();
                        scope.view.error = 'Please fill in all required fields!';

                        scope.clearTimeout();
                        timeoutId = $timeout(function() {
                            scope.view.error = '';
                        }, 5000);

                        return false;
                    }

                    scope.view.saving = true;
                    scope.view.error = '';

                    var mode = scope.user.id === Data.owner && Data.appId ? 'update' : 'insert';

                    App.addApp(mode).then(function(result) {

                        scope.view.saving = false;

                        var trace = {
                            message: 'App has been ' + (mode === 'update' ? 'updated' : 'added') + ' successfully!',
                            appId: result._id
                        };

                        $modal.open({
                            template: $templateCache.get('views/partials/app-publish-response.html'),
                            controller: ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {

                                $scope.view = {};
                                $scope.view.trace = data.trace;

                                /**
                                 * Close the modal window
                                 */
                                $scope.ok = function () {
                                    $modalInstance.close();
                                };

                            }],
                            resolve: { data: function () { return { trace: trace }; }}
                        });

                    });

                };

                /**
                 * Save revision of the app
                 *
                 * @returns {boolean}
                 */
                scope.saveApp = function() {

                    if (scope.form.$invalid) {
                        scope.form.$setDirty();
                        scope.view.error = 'Please fill in all required fields!';

                        scope.clearTimeout();
                        timeoutId = $timeout(function() {
                            scope.view.error = '';
                        }, 5000);

                        return false;
                    }

                    scope.view.saving = true;
                    scope.view.error = '';

                    App.addRevision().then(function(result) {

                        scope.view.saving = false;

                        var trace = {
                            message: 'App revision has been added successfully!',
                            revisionId: result._id
                        };

                        $modal.open({
                            template: $templateCache.get('views/partials/revision-publish-response.html'),
                            controller: ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {

                                $scope.view = {};
                                $scope.view.trace = data.trace;

                                /**
                                 * Close the modal window
                                 */
                                $scope.ok = function () {
                                    $modalInstance.close();
                                };

                            }],
                            resolve: { data: function () { return { trace: trace }; }}
                        });

                    });

                };

                /**
                 * Get the app list from the Registry
                 */
                scope.getAppsList = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/app-list.html'),
                        controller: 'AppListCtrl',
                        resolve: { options: function () { return {user: scope.user}; }}
                    });

                    modalInstance.result.then(function (selectedApp) {
                        scope.handle({app: selectedApp});
                    });

                };

                scope.$on('$destroy', function() {
                    scope.clearTimeout();
                });

                /**
                 * Clear the timeout
                 */
                scope.clearTimeout = function() {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

            }
        };
    }]);