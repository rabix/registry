'use strict';

angular.module('clicheApp')
    .directive('addApp', ['$templateCache', '$modal', '$timeout', 'Data', function ($templateCache, $modal, $timeout, Data) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/add-app.html'),
            scope: {
                form: '='
            },
            link: function(scope) {

                var timeoutId;

                scope.view = {};
                scope.view.adding = false;

                /**
                 * Add the app to the registry
                 */
                scope.addApp = function() {

                    if (scope.form.$invalid) {
                        scope.form.$setDirty();
                        scope.view.error = 'Please fill in all required fields!';

                        scope.clearTimeout();
                        timeoutId = $timeout(function() {
                            scope.view.error = '';
                        }, 5000);

                        return false;
                    }

                    scope.view.adding = true;
                    scope.view.error = '';

                    Data.addApp().then(function(result) {

                        scope.view.adding = false;

                        var trace = {
                            message: 'App has been added successfully!',
                            appId: result._id
                        };

                        $modal.open({
                            template: $templateCache.get('views/partials/add-app-response.html'),
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

                scope.$on('$destroy', function() {
                    scope.clearTimeout();
                });

                scope.clearTimeout = function() {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

            }
        };
    }]);