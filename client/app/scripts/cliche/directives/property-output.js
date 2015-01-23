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
            controller: ['$scope', '$modal', '$q', 'Data', 'Helper', 'SandBox', function ($scope, $modal, $q, Data, Helper, SandBox) {

                $scope.view = {};

                $scope.req = $scope.req || [];
                $scope.view.required = _.contains($scope.req, $scope.name);
                $scope.view.tpl = 'views/cliche/property/property-output-' + $scope.type + '-' + $scope.prop.type  + '.html';

                $scope.view.canHaveExpr = {
                    value: {error: '', self: true},
                    glob: {error: '', self: false},
                    secondaryFiles: {error: '', self: false},
                    metadata: {error: '', self: true}
                };

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

                /**
                 * Check if expression is valid
                 */
                var checkExpression = function () {

                    var self;
                    var promises = [];
                    var errors = [];
                    var itemType = ($scope.prop.items && $scope.prop.items.type) ? $scope.prop.items.type : null;

                    var evaluate = function (expr, self) {

                        var deferred = $q.defer();

                        SandBox.evaluate(expr, self)
                            .then(function () {
                                deferred.resolve();
                            }, function (error) {
                                // TODO: should use deferred.notify() but it doesn't work for some reason
                                //deferred.notify(error.name + ':' + error.message);
                                errors.push(error.name + ':' + error.message);
                                deferred.reject(errors);
                            });

                        return deferred.promise;
                    };

                    if ($scope.prop.adapter) {
                        _.each($scope.view.canHaveExpr, function (conf, name) {
                            if ($scope.prop.adapter[name]) {

                                self = conf.self ? {$self: Helper.getTestData($scope.prop.type, itemType)} : {};

                                if (name === 'metadata') {

                                    _.each($scope.prop.adapter.metadata, function(v, k) {
                                        if (k !== '__inherit__' && v.$expr) {
                                            promises.push(evaluate(v.$expr, self));
                                        }
                                    });

                                    $q.all(promises)
                                        .then(function () { conf.error = ''; })
                                        .catch(function () { conf.error = errors.join('; '); });

                                } else {
                                    if ($scope.prop.adapter[name].$expr) {
                                        SandBox.evaluate($scope.prop.adapter[name].$expr, self)
                                            .then(function () {
                                                conf.error = '';
                                            }, function (error) {
                                                conf.error = error.name + ':' + error.message;
                                            });
                                    } else { conf.error = ''; }
                                }
                            } else { conf.error = ''; }
                        });
                    } else {
                        _.each($scope.view.canHaveExpr, function (conf) { conf.error = ''; });
                    }

                };

                /* init check of the expression if defined */
                checkExpression();

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

                        checkExpression();
                        Data.generateCommand();

                    });

                };

                /**
                 * Edit property name
                 */
                $scope.editName = function() {

                    $modal.open({
                        template: $templateCache.get('views/cliche/partials/manage-property-name.html'),
                        controller: 'ManagePropertyOutputNameCtrl',
                        windowClass: 'modal-prop',
                        size: 'sm',
                        resolve: {
                            options: function () {
                                return {
                                    name: $scope.name,
                                    properties: $scope.properties
                                };
                            }
                        }
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

                $scope.$watch('prop.type', function(n, o) {
                    if (n !== o) {
                        checkExpression();
                        $scope.view.tpl = 'views/cliche/property/property-output-' + $scope.type + '-' + $scope.prop.type  + '.html';
                    }
                });

            }],
            link: function() {}
        };
    }]);