/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

// TODO: separate controllers for INPUT, OUTPUT AND ARG!!!
angular.module('registryApp.cliche')
    .controller('ManagePropertyCtrl', ['$scope', '$modalInstance', 'Data', 'options', function ($scope, $modalInstance, Data, options) {

        $scope.view = {};
        $scope.view.property = angular.copy(options.property);
        $scope.view.name = options.name;
        $scope.view.required = options.required;
        $scope.view.mode = _.isUndefined($scope.view.property) ? 'add' : 'edit';

        var map = Data.getMap()[options.type];

        if (_.isUndefined($scope.view.property)) {
            switch (options.type) {
            case 'input':
                $scope.view.property = {
                    type: 'string',
                    //adapter: {separator: ' '}
                };
                break;
            case 'output':
                $scope.view.property = {
                    type: 'file',
                    adapter: {metadata: {}}
                };
                break;
            case 'arg':
                $scope.view.property = {separator: ' '};
                break;
            }
        }

        $scope.view.disabled = ($scope.view.property.items && $scope.view.property.items.type) === 'object';
        $scope.view.isEnum = _.isArray($scope.view.property.enum);
        $scope.view.newMeta = {key: '', value: ''};

        $scope.view.inputs = [];
        _.each(Data.tool.inputs.properties, function (value, key) {
            if (value.type === 'file' || (value.items && value.items.type === 'file')) {
                $scope.view.inputs.push(key);
            }
        });

        if (options.type === 'output' && _.isUndefined($scope.view.property.adapter)) {
            $scope.view.property.adapter = {};
        }

        if ($scope.view.property.adapter && _.isArray($scope.view.property.adapter.secondaryFiles) && $scope.view.property.adapter.secondaryFiles.length === 0) {
            //$scope.view.property.adapter.secondaryFiles = '';
            delete $scope.view.property.adapter.secondaryFiles;
            $scope.view.isSecondaryFilesExpr = true;
        } else if ($scope.view.property.adapter && !_.isArray($scope.view.property.adapter.secondaryFiles)) {
            $scope.view.isSecondaryFilesExpr = true;
        }

        var checkInputAdapter = function() {
            if (options.type === 'input' && _.isUndefined($scope.view.property.adapter)) {
                $scope.view.property.adapter = {};
            }
        };

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
                $modalInstance.close({prop: $scope.view.property, required: $scope.view.required});
            } else {
                Data.addProperty(options.type, $scope.view.name, $scope.view.property, options.properties)
                    .then(function() {
                        $modalInstance.close({name: $scope.view.name, required: $scope.view.required});
                    }, function(error) {
                        $scope.view.error = error;
                    });
            }

        };

        /* watch for the type change in order to adjust the property structure */
        $scope.$watch('view.property.type', function(n, o) {
            if (n !== o) {

                _.each($scope.view.property, function(fields, key) {

                    if (!_.contains(_.keys(map[n].root), key) && key !== 'adapter') {
                        delete $scope.view.property[key];
                        if (key === 'enum') { $scope.view.isEnum = false; }
                    }

                    _.each(map[n].root, function(value, field) {
                        if (_.isUndefined($scope.view.property[field])) {
                            $scope.view.property[field] = value;
                        }
                    });

                });

                _.each($scope.view.property.adapter, function(fields, key) {

                    if (!_.contains(_.keys(map[n].adapter), key)) {
                        delete $scope.view.property.adapter[key];
                    }

                    _.each(map[n].adapter, function(value, field) {
                        if (_.isUndefined($scope.view.property.adapter[field])) {
                            $scope.view.property.adapter[field] = value;
                        }
                    });

                });

            }
        });

        /* watch for the items type change in order to adjust the property structure */
        $scope.$watch('view.property.items.type', function(n, o) {
            if (n !== o) {
                if (n === 'object') {
                    $scope.view.disabled = true;

                    if ($scope.view.mode === 'edit') {
                        options.inputs[$scope.name] = [];
                    }

                    checkInputAdapter();

                    if (_.isUndefined($scope.view.property.items.properties)) {
                        $scope.view.property.items.properties = {};
                        $scope.view.property.adapter.prefix = '';
                        $scope.view.property.adapter.listSeparator = undefined;
                        $scope.view.property.adapter.separator = ' ';
                        $scope.view.property.adapter.value = undefined;
                    }
                } else {
                    $scope.view.disabled = false;
                    if (!_.isUndefined($scope.view.property.items)) {
                        delete $scope.view.property.items.properties;
                    }
                }
            }
        });

        /* watch for inherit property change */
        $scope.$watch('view.property.adapter.metadata.__inherit__', function(n, o) {
            if (n !== o) {
                if (_.isEmpty(n)) {
                    delete $scope.view.property.adapter.metadata.__inherit__;
                }
            }
        });

        $scope.$watch('view.property.adapter.secondaryFiles.length', function(n, o) {
            if (n !== o && n === 0) {
                //$scope.view.property.adapter.secondaryFiles = '';
                delete $scope.view.property.adapter.secondaryFiles;
                $scope.view.isSecondaryFilesExpr = true;
            }
        });

        /**
         * Toggle secondary files into array
         */
        $scope.toggleToList = function() {
            $scope.view.property.adapter.secondaryFiles = [];
            $scope.view.property.adapter.secondaryFiles.push('');
            $scope.view.isSecondaryFilesExpr = false;
        };

        /**
         * Update secondary files value
         *
         * @param value
         */
        $scope.updateSecondaryFilesValue = function(value) {
            $scope.view.property.adapter.secondaryFiles = value;
        };

        /**
         * Toggle enum flag
         */
        $scope.toggleEnum = function() {
            if ($scope.view.isEnum) {
                $scope.view.property.enum = [''];
            } else {
                delete $scope.view.property.enum;
            }
        };

        /**
         * Update transform value with expression
         *
         * @param value
         */
        $scope.updateTransform = function (value, key) {
            checkInputAdapter();
            $scope.view.property.adapter[key] = value;
        };

        /**
         * Add meta data to the output
         */
        $scope.addMeta = function () {

            $scope.view.newMeta.error = false;

            if (!$scope.view.property.adapter.metadata) {
                $scope.view.property.adapter.metadata = {};
            }

            if (!_.isUndefined($scope.view.property.adapter.metadata[$scope.view.newMeta.key]) || $scope.view.newMeta.key === '') {
                $scope.view.newMeta.error = true;
                return false;
            }

            $scope.view.property.adapter.metadata[$scope.view.newMeta.key] = $scope.view.newMeta.value;
            $scope.view.newMeta = {key: '', value: ''};

        };

        /**
         * Remove meta data from the output
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeMeta = function (index) {
            delete $scope.view.property.adapter.metadata[index];
        };

        /**
         * Update new meta value with expression or literal
         *
         * @param value
         */
        $scope.updateNewMeta = function (value) {
            $scope.view.newMeta.value = value;
        };

        /**
         * Update existing meta value with expression or literal
         *
         * @param value
         */
        $scope.updateMetaValue = function (index, value) {
            $scope.view.property.adapter.metadata[index] = value;
        };

        /**
         * Update existing glob value with expression or literal
         *
         * @param value
         */
        $scope.updateGlobValue = function (value) {
            $scope.view.property.adapter.glob = value;
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
