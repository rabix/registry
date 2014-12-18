/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:10 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyArgCtrl', ['$scope', '$modalInstance', 'Data', 'options', function ($scope, $modalInstance, Data, options) {

        $scope.view = {};
        $scope.view.property = angular.copy(options.property);
        $scope.view.name = options.name;
        $scope.view.mode = _.isUndefined($scope.view.property) ? 'add' : 'edit';

        if (_.isUndefined($scope.view.property)) {
            $scope.view.property = {separator: ' '};
        }

        /**
         * Save property changes
         *
         * @returns {boolean}
         */
        $scope.save = function() {

            $scope.view.error = '';
            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            if ($scope.view.mode === 'edit') {
                $modalInstance.close({prop: $scope.view.property});
            } else {
                Data.addProperty('arg', $scope.view.name, $scope.view.property, options.properties)
                    .then(function() {
                        $modalInstance.close({name: $scope.view.name});
                    }, function(error) {
                        $scope.view.error = error;
                    });
            }

        };

        /**
         * Update argument if expression defined
         *
         * @param {*} value
         */
        $scope.updateArgument = function (value) {
            $scope.view.property.value = value;
        };

        /**
         * Close modal
         */
        $scope.ok = function () {
            $modalInstance.close();
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
