'use strict';

angular.module('clicheApp')
    .controller('AddPropertyCtrl', ['$scope', '$modalInstance', 'Data', 'options', function ($scope, $modalInstance, Data, options) {

        $scope.options = options;

        $scope.view = {};
        $scope.view.inputs = _.keys(Data.tool.inputs.properties);

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
                adapter: {meta: []}
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

        /**
         * Add meta data to the output
         */
        $scope.addMeta = function () {
            $scope.view.property.adapter.meta.push({key: '', value: ''});
        };

        /**
         * Remove meta data from the output
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeMeta = function (index) {

            if ($scope.view.property.adapter.meta.length === 1) { return false; }

            $scope.view.property.adapter.meta.splice(index, 1);
        };

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
