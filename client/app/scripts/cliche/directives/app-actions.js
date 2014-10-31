/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('appActions', ['$templateCache', '$modal', '$timeout', 'App', function ($templateCache, $modal, $timeout, App) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/app-actions.html'),
            scope: {
                app: '=',
                currentRevision: '=',
                form: '=',
                user: '=',
                handleImport: '&',
                handleRedirect: '&'
            },
            link: function(scope) {

                var timeoutId;

                scope.view = {};
                scope.view.saving = false;

                scope.save = function(action) {

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

                    /**
                     * Save revision or create/publish current app
                     */
                    App.save(action, scope.app._id, scope.currentRevision)
                        .then(function(result) {

                            scope.view.saving = false;

                            var trace = {
                                message: result.message
                            };

                            var modalInstance = $modal.open({
                                template: $templateCache.get('views/cliche/partials/app-save-response.html'),
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

                            modalInstance.result.then(function() {

                                if (_.contains(['create', 'save'], action)) {

                                    var revisionId = (action === 'save') ? result.revision._id : 'latest';
                                    var appId = result.app ? result.app._id : scope.app._id;

                                    scope.handleRedirect({url: '/cliche/' + appId + '/' + revisionId});
                                }

                                if (action === 'publish') {
                                    scope.app.revision_id = scope.currentRevision.id;
                                }

                            }, function() {
                                // TODO this will be removed later
                                if (_.contains(['create', 'save'], action)) {
                                    var revisionId = (action === 'save') ? result.revision._id : 'latest';
                                    var appId = result.app ? result.app._id : scope.app._id;
                                    scope.handleRedirect({url: '/cliche/' + appId + '/' + revisionId});
                                }
                            });


                        }, function () {
                            scope.view.saving = false;
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
                        scope.handleImport({json: json});
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