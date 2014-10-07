'use strict';

angular.module('clicheApp')
    .directive('jobActions', ['$templateCache', '$modal', '$timeout', 'Job', function ($templateCache, $modal, $timeout, Job) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/job-actions.html'),
            scope: {
                user: '='
            },
            link: function (scope) {

                scope.view = {};
                scope.view.saving = false;

                /**
                 * Get the url of the job json
                 */
                scope.getUrl = function () {

                    scope.view.saving = true;
                    scope.view.error = '';

                    Job.getUrl().then(function (result) {

                        scope.view.saving = false;

                        var trace = {
                            message: 'Job json URL',
                            url: result.url
                        };

                        $modal.open({
                            template: $templateCache.get('views/partials/job-url-response.html'),
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


            }
        };
    }]);