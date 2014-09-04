'use strict';

angular.module('clicheApp')
    .directive('addApp', ['$templateCache', '$modal', 'Data', function ($templateCache, $modal, Data) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/add-app.html'),
            scope: {},
            link: function(scope) {

                scope.view = {};
                scope.view.adding = false;

                /**
                 * Add the app to the registry
                 */
                scope.addApp = function() {

                    scope.view.adding = true;

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

            }
        };
    }]);