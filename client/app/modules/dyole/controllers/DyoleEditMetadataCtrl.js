/**
 * @ngdoc controller
 * @name registryApp.dyole.controller:DyoleEditMetadataCtrl
 *
 * @description
 * Ctrl for editing workflow metadata
 *
 * @requires $scope
 * */

'use strict';

angular.module('registryApp.dyole')
    .controller('DyoleEditMetadataCtrl', ['$scope', '$modalInstance', 'data', 'HelpMessages', function($scope, $modalInstance, data, HelpMessages){
        $scope.help = HelpMessages;
        $scope.view = {};

        $scope.view.tool = angular.copy(data.tool);

        /**
         * Toggle markdown preview
         */
        $scope.togglePreview = function() {
            $scope.view.preview = !$scope.view.preview;
        };

        /**
         * Close the modal window
         */
        $scope.edit = function () {
            $modalInstance.close($scope.view.tool);
        };

        /**
         * Close the modal window
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
