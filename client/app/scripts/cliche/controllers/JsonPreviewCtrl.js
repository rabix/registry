/**
 * Author: Milica Kadic
 * Date: 11/19/14
 * Time: 2:23 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('JsonPreviewCtrl', ['$scope', '$modalInstance', 'Job', 'data', function ($scope, $modalInstance, Job, data) {

        $scope.view = {};
        $scope.data = data;

        $scope.data.stringJson = JSON.stringify(data.json);

        /**
         * Close the modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        /**
         * Get the url for the job json
         */
        $scope.getUrl = function() {

            $scope.view.saving = true;

            Job.getUrl().then(function (result) {

                var trace = {};
                trace.url = result.url;
                trace.message = 'Job json URL';

                $scope.view.saving = false;

                $modalInstance.close(trace);

            }, function () {
                $scope.view.saving = false;
            });

        };

    }]);
