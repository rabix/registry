/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('jobActions', ['$templateCache', '$modal', '$timeout', '$location', 'Job', function ($templateCache, $modal, $timeout, $location, Job) {

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/job-actions.html'),
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
                        var trace = {};

//                        trace.url = (_.isEmpty(scope.user)) ? $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/jobs/' + result.url : result.url;
                        trace.url = result.url;
                        trace.message = 'Job json URL' + (_.isEmpty(scope.user) ? ' (this url will expire in 24 hours)' : '');

                        $modal.open({
                            template: $templateCache.get('views/cliche/partials/job-url-response.html'),
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

                        if (_.isEmpty(scope.user)) {
                            Job.storeJobLocally(result.url);
                        }

                    }, function () {
                        scope.view.saving = false;
                    });

                };


            }
        };
    }]);