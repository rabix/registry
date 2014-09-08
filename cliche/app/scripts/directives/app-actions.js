'use strict';

angular.module('clicheApp')
    .directive('appActions', ['$templateCache', '$modal', '$timeout', 'App', function ($templateCache, $modal, $timeout, App) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/app-actions.html'),
            scope: {
                form: '=',
                handle: '&'
            },
            link: function(scope) {

                var timeoutId;

                scope.view = {};
                scope.view.publishing = false;

                /**
                 * Add the app to the registry
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

                    scope.view.publishing = true;
                    scope.view.error = '';

                    App.addApp().then(function(result) {

                        scope.view.publishing = false;

                        var trace = {
                            message: 'App has been added successfully!',
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
                 * Get the app list from the Registry
                 */
                scope.getAppsList = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/app-list.html'),
                        controller: 'AppListCtrl',
                        resolve: { data: function () { return {}; }}
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