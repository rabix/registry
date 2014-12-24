/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyOutput', ['$templateCache', function ($templateCache) {

        return {
            restrict: 'E',
            template: '<div class="property-box" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                name: '@',
                type: '@',
                prop: '=ngModel',
                active: '=',
                req: '=',
                properties: '='
            },
            controller: ['$scope', '$modal', 'Data', function ($scope, $modal, Data) {

                $scope.view = {};

                $scope.req = $scope.req || [];
                $scope.view.required = _.contains($scope.req, $scope.name);
                $scope.view.tpl = 'views/cliche/property/property-output-' + $scope.type + '-' + $scope.prop.type  + '.html';

                /**
                 * Transform meta into string
                 *
                 * @returns {string}
                 */
                var transformMeta = function() {

                    var value;
                    var metadata = [];

                    if ($scope.prop.adapter) {
                        _.each($scope.prop.adapter.metadata, function(v, k) {
                            if (k !== '__inherit__') {
                                value = v.$expr ? v.$expr : v;
                                metadata.push(k + ': ' + value);
                            }
                        });
                    }

                    return metadata.join(', ');
                };

                /* init transform */
                $scope.view.metadata = transformMeta();

                /**
                 * Toggle property box visibility
                 */
                $scope.toggle = function() {
                    $scope.active = !$scope.active;
                };

                /**
                 * Edit property
                 */
                $scope.edit = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/manage-property-' + $scope.type + '-output.html'),
                        controller: 'ManagePropertyOutputCtrl',
                        windowClass: 'modal-prop',
                        size: 'lg',
                        resolve: {
                            options: function () {
                                return {
                                    type: 'output',
                                    toolType: $scope.type,
                                    name: $scope.name,
                                    property: $scope.prop,
                                    properties: $scope.properties,
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
                        $scope.view.metadata = transformMeta();

                        if (result.required && !_.contains($scope.req, $scope.name)) {
                            $scope.req.push($scope.name);
                        } else {
                            _.remove($scope.req, function(key) { return key === $scope.name; });
                        }

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
                        Data.deleteProperty('output', $scope.name, $scope.properties);
                        Data.generateCommand();
                    });
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
            link: function() {}
        };
    }]);