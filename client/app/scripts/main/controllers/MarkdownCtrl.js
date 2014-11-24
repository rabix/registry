/**
 * Author: Milica Kadic
 * Date: 11/24/14
 * Time: 2:38 PM
 */

'use strict';

angular.module('registryApp')
    .controller('MarkdownCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

        $scope.view = {};
        $scope.view.description = data.markdown;
        $scope.view.preview = false;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.togglePreview = function() {
            $scope.view.preview = !$scope.view.preview;
        };

        $scope.finish = function() {
            $modalInstance.close($scope.view.description);
        };

    }]);
