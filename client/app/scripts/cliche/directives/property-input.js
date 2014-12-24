/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyInput', ['$templateCache', 'RecursionHelper', function ($templateCache, RecursionHelper) {

        return {
            restrict: 'E',
            template: '<div class="property-box {{ type }}" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                name: '@',
                type: '@',
                prop: '=ngModel',
                active: '=',
                properties: '=',
                inputs: '=',
                req: '=',
                handler: '&'
            },
            controller: ['$scope', '$modal', 'Data', function ($scope, $modal, Data) {

                $scope.view = {};

                $scope.view.propsExpanded = false;
                $scope.view.active = {};

                $scope.req = $scope.req || [];
                $scope.view.required = _.contains($scope.req, $scope.name);
                $scope.view.tpl = 'views/cliche/property/property-input-' + $scope.type + '-' + $scope.prop.type  + '.html';

                /**
                 * Toggle property box visibility
                 */
                $scope.toggle = function() {
                    $scope.active = !$scope.active;
                };

                /**
                 * Toggle properties visibility (expand/collapse)
                 */
                $scope.toggleProperties = function() {

                    $scope.view.propsExpanded = !$scope.view.propsExpanded;

                    _.each($scope.prop.items.properties, function(value, key) {
                        $scope.view.active[key] = $scope.view.propsExpanded;
                    });

                };

                /**
                 * Edit property
                 */
                $scope.edit = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/manage-property-' + $scope.type + '-input.html'),
                        controller: 'ManagePropertyInputCtrl',
                        windowClass: 'modal-prop',
                        size: 'lg',
                        resolve: {
                            options: function () {
                                return {
                                    type: 'input',
                                    toolType: $scope.type,
                                    name: $scope.name,
                                    property: $scope.prop,
                                    properties: $scope.properties,
                                    inputs: $scope.inputs,
                                    required: $scope.view.required
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(result) {

                        var keys = _.keys(result.prop);

                        _.each(result.prop, function(value, key) {
                            $scope.prop[key] = value;
                        });

                        _.each($scope.prop, function(value, key) {
                            if (!_.contains(keys, key)) {
                                delete $scope.prop[key];
                            }
                        });

                        $scope.view.required = result.required;

                        if (result.required && !_.contains($scope.req, $scope.name)) {
                            $scope.req.push($scope.name);
                        } else {
                            _.remove($scope.req, function(key) { return key === $scope.name; });
                        }

                        $scope.handler();

                        Data.generateCommand();

                    });

                };

                /**
                 * Remove particular property
                 */
                $scope.remove = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/confirm-delete.html'),
                        controller: 'ModalCtrl',
                        windowClass: 'modal-confirm',
                        resolve: {data: function () { return {}; }}
                    });

                    modalInstance.result.then(function () {
                        Data.deleteProperty('input', $scope.name, $scope.properties);

                        if ($scope.inputs &&  !_.isUndefined($scope.inputs[$scope.name])) {
                            delete $scope.inputs[$scope.name];
                        }

                        if (_.isArray($scope.inputs)) {
                            _.each($scope.inputs, function(input) {
                                if (!_.isUndefined(input)) {
                                    delete input[$scope.name];
                                }
                            });
                        }

                        $scope.handler();

                        Data.generateCommand();

                    });
                };

                /**
                 * Remove adapter section of the input and regenerate command
                 */
                $scope.removeFromConsole = function() {

                    delete $scope.prop.adapter;

                    Data.generateCommand();

                };

                /**
                 * Handle actions initiated from the property header
                 *
                 * @param action
                 */
                $scope.handleAction = function(action) {

                    if (typeof $scope[action] === 'function') {
                        $scope[action]();
                    }
                };

            }],
            compile: function(element) {
                return RecursionHelper.compile(element, function() {});
            }
        };
    }]);