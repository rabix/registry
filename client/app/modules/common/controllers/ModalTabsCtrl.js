'use strict';

angular.module('registryApp.common')
    .controller('ModalTabsCtrl', ['$scope', '$modalInstance', 'data', 'common', function ($scope, $modalInstance, data, Common) {

        $scope.data = data.model;
        $scope.schema = _.clone(data.schema, true) || {};

        if (typeof $scope.schema.id !== 'undefined') {
            $scope.schema.id = null;
            delete $scope.schema.id;
        }

        $scope.view = {};

        $scope.view.tab = data.tabName || 'info';

        $scope.inputConnections = {};

        $scope.sortableOptions = {
//            handle: ' .handle'
            // items: ' .panel:not(.panel-heading)'
            // axis: 'y'
            stop: function(e, ui) {
                // this callback has the changed model
                var inputId = ui.item.data('input');
                console.log($scope.inputConnections[inputId]);
            }
        };

        var inputRefs = $scope.data.inputs;

        inputRefs.sort(function (a, b) {
            if (a['id'] < b['id']) { return 1; }
            if (b['id'] < a['id']) { return -1; }
            return 0;
        });
        
        _.forEach(data.connections, function (connection) {
            if ( typeof $scope.inputConnections[connection.input_name] === 'undefined') {
                $scope.inputConnections[connection.input_name] = [];
            }

            $scope.inputConnections[connection.input_name].push(connection);
        });

        _.forEach($scope.inputConnections, function (connections) {

            connections.sort(function (a, b) {
                if (a.position > b.position) { return 1; }
                if (b.position > a.position) { return -1; }
                return 0;
            });

        });

        var _filterInputs = function () {
            var inputs = [],
                filter = ['file', 'File', 'directory'];

            _.each(inputRefs, function (input) {

                if (Common.checkTypeFile(input.type[1] || input.type[0])) {
                    input.required = input.type.length === 1;
                    inputs.push(input);
                }

            });

            return inputs.length === 0 ? data.inputs : inputs;
        };

        $scope.view.inputs = _filterInputs();
        // placeholder for input values
        $scope.inputValues = {};

        if (typeof $scope.data.scatter !== 'undefiend' && typeof $scope.data.scatter === 'string') {
            $scope.inputValues[$scope.data.scatter] = true;
        }

        $scope.onScatterChange = function (id, value) {
            console.log(id, value);

            if (value) {
                _.forEach($scope.inputValues, function (val, inputId) {
                    if (inputId !== id) {
                        $scope.inputValues[inputId] = false;
                    }
                });
            }
        };

        /**
         * Switch tab on the right side
         *
         * @param {string} tab
         */
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;
        };

        /**
         * Close the modal
         */
        $scope.ok = function () {
            var scatter = false;
            _.forEach($scope.inputValues, function (val, inputId) {
                if (val) {
                    scatter = inputId;
                }
            });

            _.forEach($scope.inputConnections, function (connections, inputId) {
                _.forEach(connections, function (connection, index) {
                    connection.position = index;
                });

            });

            $modalInstance.close(scatter);
        };

        /**
         * Dismiss the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
