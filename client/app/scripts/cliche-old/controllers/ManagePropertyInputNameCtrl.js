/**
 * Author: Milica Kadic
 * Date: 12/31/14
 * Time: 2:44 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyInputNameCtrl', ['$scope', '$modalInstance', 'options', function ($scope, $modalInstance, options) {

        $scope.view = {};
        $scope.view.name = options.name;

        var oldName = options.name;


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

            if (oldName !== $scope.view.name) {

                if (!_.isUndefined(options.properties[$scope.view.name]) || _.isEmpty(oldName)) {
                    $scope.view.error = 'Choose another name, the one already exists';
                    return false;
                }

                options.properties[$scope.view.name] = angular.copy(options.properties[oldName]);

                if (options.inputs && !_.isUndefined(options.inputs[oldName])) {
                    options.inputs[$scope.view.name] = angular.copy(options.inputs[oldName]);
                    delete options.inputs[oldName];
                }

                if (_.isArray(options.inputs)) {
                    _.each(options.inputs, function(input) {
                        if (!_.isUndefined(input)) {
                            input[$scope.view.name] = angular.copy(input[oldName]);
                            delete input[oldName];
                        }
                    });
                }

                delete options.properties[oldName];

            }

            $modalInstance.close();

        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
