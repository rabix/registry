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

                scope.view.inputs = [];
                _.each(Data.tool.inputs.properties, function (value, key) {
                    if (value.type === 'file' || (value.items && value.items.type === 'file')) {
                        scope.view.inputs.push(key);
                    }
                });

                scope.view.newMeta = {key: '', value: ''};

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

                /**
                 * Add meta data to the output
                 */
                scope.addMeta = function () {

                    scope.view.newMeta.error = false;

                    if (!_.isUndefined(scope.prop.adapter.meta[scope.view.newMeta.key]) || scope.view.newMeta.key === '') {
                        scope.view.newMeta.error = true;
                        return false;
                    }

                    scope.prop.adapter.meta[scope.view.newMeta.key] = scope.view.newMeta.value;
                    scope.view.newMeta = {key: '', value: ''};

                };

                /**
                 * Remove meta data from the output
                 *
                 * @param {integer} index
                 * @returns {boolean}
                 */
                scope.removeMeta = function (index) {
                    delete scope.prop.adapter.meta[index];
                };

                /**
                 * Update new meta value with expression or literal
                 *
                 * @param value
                 */
                scope.updateNewMeta = function (value) {
                    scope.view.newMeta.value = value;
                };

                /**
                 * Update existing meta value with expression or literal
                 *
                 * @param value
                 */
                scope.updateMetaValue = function (index, value) {
                    scope.prop.adapter.meta[index] = value;
                };

            }
        };
    }]);