'use strict';

angular.module('clicheApp')
    .controller('AddPropertyCtrl', ['$scope', '$modalInstance', 'Data', 'options', function ($scope, $modalInstance, Data, options) {

        $scope.options = options;

        $scope.view = {};

        switch (options.type) {
        case 'input':
            $scope.view.property = {
                type: 'string',
                adapter: {separator: '_'}
            };
            break;
        case 'output':
            $scope.view.property = {
                type: 'file',
                adapter: {meta: {}}
            };
            break;
        case 'arg':
            $scope.view.property = {separator: '_'};
            break;
        }


        $scope.addProperty = function() {

            $scope.view.error = '';
            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            Data.addProperty(options.type, $scope.view.name, $scope.view.property, options.properties)
                .then(function() {
                    $modalInstance.close();
                }, function(error) {
                    $scope.view.error = error;
                });

        };

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
