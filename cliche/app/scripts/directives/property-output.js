'use strict';

angular.module('clicheApp')
    .directive('propertyOutput', ['$templateCache', '$modal', 'Data', function ($templateCache, $modal, Data) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/property-output.html'),
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                requiredInputs: '=',
                properties: '=',
                form: '='
            },
            link: function(scope) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;
                scope.view.isEnum = _.isArray(scope.prop.enum);
                scope.view.edit = false;

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
                 * Toggle property box visibility
                 */
                scope.toggleProperty = function() {
                    scope.active = !scope.active;
                };

                /**
                 * Remove particular property
                 * @param e
                 */
                scope.removeItem = function(e) {

                    e.stopPropagation();

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/confirm-delete.html'),
                        controller: 'ModalCtrl',
                        windowClass: 'modal-confirm',
                        resolve: {data: function () { return {}; }}
                    });

                    modalInstance.result.then(function () {
                        Data.deleteProperty('output', scope.name, scope.properties);
                    });
                };

                /**
                 * Change the name of the property
                 * @param e
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

                var map = Data.getMap().output;

                /* watch for the type change in order to adjust the property structure */
                scope.$watch('prop.type', function(n, o) {
                    if (n !== o) {

                        _.each(scope.prop, function(fields, key) {

                            if (!_.contains(_.keys(map[n].root), key) && key !== 'adapter') {
                                delete scope.prop[key];
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

            }
        };
    }]);