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
                        scope.properties[scope.view.name] = _.cloneDeep(scope.properties[scope.name], function() {
                            delete scope.properties[scope.name];
                        });
                    }

                    scope.name = scope.view.name;

                    scope.view.edit = false;

                };

                /**
                 * Stop event propagation
                 * @param e
                 */
                scope.stopPropagation = function(e) {
                    e.stopPropagation();
                };

            }
        };
    }]);