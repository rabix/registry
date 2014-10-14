/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('appActions', ['$templateCache', '$modal', '$timeout', 'App', 'Data', function ($templateCache, $modal, $timeout, App, Data) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/app-actions.html'),
            scope: {
                form: '=',
                user: '=',
                handleImport: '&',
                handleSave: '&',
                handleImportJson: '&'
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

                    App.addApp(mode)
                        .then(function(result) {

                            scope.handleSave({user_id: result.user_id, app_id: result._id});

                            scope.view.saving = false;

                            var trace = {
                                message: 'App has been ' + (mode === 'update' ? 'updated' : 'added') + ' successfully!',
                                appId: result._id
                            };

                            $modal.open({
                                template: $templateCache.get('views/cliche/partials/app-publish-response.html'),
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

                        }, function () {
                            scope.view.saving = false;
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

                    App.addRevision()
                        .then(function(result) {

                            scope.view.saving = false;

                            var trace = {
                                message: 'App revision has been added successfully!',
                                revisionId: result._id
                            };

                            $modal.open({
                                template: $templateCache.get('views/cliche/partials/revision-publish-response.html'),
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

                        }, function () {
                            scope.view.saving = false;
                        });

                };

                /**
                 * Get the app list from the Registry
                 */
                scope.getAppsList = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/app-list.html'),
                        controller: 'AppListCtrl',
                        resolve: { options: function () { return {user: scope.user}; }}
                    });

                    modalInstance.result.then(function (selectedApp) {
                        scope.handleImport({app: selectedApp});
                    });

                };

                /**
                 * Load json editor
                 */
                scope.loadJsonEditor = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/json-editor.html'),
                        controller: 'JsonEditorCtrl',
                        resolve: { options: function () { return {user: scope.user}; }}
                    });

                    modalInstance.result.then(function (json) {
                        scope.handleImportJson({json: json});
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