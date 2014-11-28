/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyInput', ['$templateCache', '$modal', 'Data', 'RecursionHelper', function ($templateCache, $modal, Data, RecursionHelper) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/property-input.html'),
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                properties: '=',
                inputs: '=',
                form: '=',
                req: '=',
                parent: '@'
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope) {

                    scope.view = {};

                    scope.view.parent = scope.parent ? scope.parent + '.' + scope.name : scope.name;

                    uniqueId++;
                    scope.view.uniqueId = uniqueId;
                    scope.view.isEnum = _.isArray(scope.prop.enum);

                    scope.view.propsExpanded = false;
                    scope.view.active = {};
                    scope.view.disabled = (scope.prop.items && scope.prop.items.type) === 'object';
                    scope.view.edit = false;

                    scope.req = scope.req || [];
                    scope.view.required = _.contains(scope.req, scope.name);

                    /**
                     * Toggle required array
                     */
                    scope.toggleRequired = function() {

                        if (scope.view.required) {
                            scope.req.push(scope.name);
                        } else {
                            _.remove(scope.req, function(key) { return key === scope.name; });
                        }
                    };

                    /**
                     * Toggle edit name form
                     *
                     * @param e
                     */
                    scope.toggleEdit = function(e) {
                        e.stopPropagation();
                        scope.view.edit = !scope.view.edit;
                        if (scope.view.edit) {
                            scope.view.name = angular.copy(scope.name);
                        }
                    };

                    /**
                     * Toggle properties visibility (expand/collapse)
                     */
                    scope.toggleProperties = function() {

                        scope.view.propsExpanded = !scope.view.propsExpanded;

                        _.each(scope.prop.items.properties, function(value, key) {
                            scope.view.active[key] = scope.view.propsExpanded;
                        });
                    };

                    /**
                     * Toggle property box visibility
                     */
                    scope.toggleProperty = function() {
                        scope.active = !scope.active;
                    };


                    /**
                     * Toggle enum flag
                     */
                    scope.toggleEnum = function() {
                        if (scope.view.isEnum) {
                            scope.prop.enum = [''];
                        } else {
                            scope.prop.enum = null;
                        }
                    };

                    /**
                     * Remove particular property
                     * @param e
                     */
                    scope.removeItem = function(e) {

                        e.stopPropagation();

                        var modalInstance = $modal.open({
                            template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                            controller: 'ModalCtrl',
                            windowClass: 'modal-confirm',
                            resolve: {data: function () { return {}; }}
                        });

                        modalInstance.result.then(function () {
                            Data.deleteProperty('input', scope.name, scope.properties);

                            if (scope.inputs &&  !_.isUndefined(scope.inputs[scope.name])) {
                                delete scope.inputs[scope.name];
                            }

                            if (_.isArray(scope.inputs)) {
                                _.each(scope.inputs, function(input) {
                                    if (!_.isUndefined(input)) {
                                        delete input[scope.name];
                                    }
                                });
                            }

                        });
                    };

                    /**
                     * Change the name of the property
                     * @param e
                     * @returns {boolean}
                     */
                    scope.changeName = function(e) {

                        e.stopPropagation();

                        scope.view.error = false;

                        if (!_.isUndefined(e.keyCode)) {
                            if (e.keyCode !== 13 && e.keyCode !== 0) {
                                return false;
                            }
                        }

                        if (!_.isUndefined(scope.properties[scope.view.name]) || _.isEmpty(scope.view.name)) {
                            scope.view.error = true;
                            return false;
                        } else {

                            scope.properties[scope.view.name] = angular.copy(scope.properties[scope.name]);

                            if (scope.inputs && !_.isUndefined(scope.inputs[scope.name])) {
                                scope.inputs[scope.view.name] = angular.copy(scope.inputs[scope.name]);
                                delete scope.inputs[scope.name];
                            }

                            if (_.isArray(scope.inputs)) {
                                _.each(scope.inputs, function(input) {
                                    if (!_.isUndefined(input)) {
                                        input[scope.view.name] = angular.copy(input[scope.name]);
                                        delete input[scope.name];
                                    }
                                });
                            }

                            delete scope.properties[scope.name];

                            scope.name = scope.view.name;
                            scope.view.edit = false;

                        }

                    };

                    /**
                     * Stop event propagation
                     * @param e
                     */
                    scope.stopPropagation = function(e) {
                        e.stopPropagation();
                    };

                    var map = Data.getMap().input;

                    /* watch for the type change in order to adjust the property structure */
                    scope.$watch('prop.type', function(n, o) {
                        if (n !== o) {

                            _.each(scope.prop, function(fields, key) {

                                if (!_.contains(_.keys(map[n].root), key) && key !== 'adapter') {
                                    delete scope.prop[key];
                                    if (key === 'enum') { scope.view.isEnum = false; }
                                }

                                _.each(map[n].root, function(value, field) {
                                    if (_.isUndefined(scope.prop[field])) {
                                        scope.prop[field] = value;
                                    }
                                });

                            });

                            _.each(scope.prop.adapter, function(fields, key) {

                                if (!_.contains(_.keys(map[n].adapter), key)) {
                                    delete scope.prop.adapter[key];
                                }

                                _.each(map[n].adapter, function(value, field) {
                                    if (_.isUndefined(scope.prop.adapter[field])) {
                                        scope.prop.adapter[field] = value;
                                    }
                                });

                            });
                        }
                    });

                    /* watch for the items type change in order to adjust the property structure */
                    scope.$watch('prop.items.type', function(n, o) {
                        if (n !== o) {
                            if (n === 'object') {
                                scope.view.disabled = true;

                                scope.inputs[scope.name] = [];

                                if (_.isUndefined(scope.prop.items.properties)) {
                                    scope.prop.items.properties = {};
                                    scope.prop.adapter.prefix = '';
                                    scope.prop.adapter.listSeparator = undefined;
                                    scope.prop.adapter.separator = ' ';
                                    scope.prop.adapter.transform = undefined;
                                }
                            } else {
                                scope.view.disabled = false;
                                if (!_.isUndefined(scope.prop.items)) {
                                    delete scope.prop.items.properties;
                                }
                            }
                        }
                    });

                    /**
                     * Edit custom expression for input value evaluation
                     */
                    scope.editExpression = function (transformKey) {

                        var expr = (scope.prop.adapter[transformKey] && scope.prop.adapter[transformKey].expr) ? scope.prop.adapter[transformKey].expr.value : '';

                        var modalInstance = $modal.open({
                            template: $templateCache.get('views/cliche/partials/edit-expression.html'),
                            controller: 'ExpressionCtrl',
                            windowClass: 'modal-expression',
                            resolve: {
                                options: function () {
                                    return {
                                        expr: expr,
                                        self: true
                                    };
                                }
                            }
                        });

                        modalInstance.result.then(function (expr) {
                            if (_.isEmpty(expr)) {
                                delete scope.prop.adapter[transformKey];
                            } else {
                                if (_.isUndefined(scope.prop.adapter[transformKey]) || !_.isObject(scope.prop.adapter[transformKey])) {
                                    scope.prop.adapter[transformKey] = {};
                                }
                                scope.prop.adapter[transformKey].expr = {value: expr, lang: 'javascript'};
                            }

                        });

                    };


                });
            }
        };
    }]);