/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('argument', ['$templateCache', '$modal', '$compile', 'Data', function ($templateCache, $modal, $compile, Data) {

        return {
            restrict: 'E',
            replace: true,
            template: '<div class="property-box" ng-class="{active: active}"></div>',
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                properties: '='
            },
            link: function(scope, element) {

                scope.view = {};

                /**
                 * Compile appropriate template
                 */
                var compileTpl = function() {

                    var template = $templateCache.get('views/cliche/property/property-argument.html');

                    var $header = element[0].querySelector('.property-box-header');
                    var $body = element[0].querySelector('.property-box-body');

                    if ($header) { angular.element($header).remove(); }
                    if ($body) { angular.element($body).remove(); }

                    element.append(template);

                    $compile(element.contents())(scope);
                };

                /* init compile */
                compileTpl();

                /**
                 * Toggle argument box visibility
                 */
                scope.toggle = function() {
                    scope.active = !scope.active;
                };

                /**
                 * Remove particular property
                 */
                scope.remove = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                        controller: 'ModalCtrl',
                        windowClass: 'modal-confirm',
                        resolve: {data: function () { return {}; }}
                    });

                    modalInstance.result.then(function () {
                        Data.deleteProperty('arg', scope.name, scope.properties);
                        Data.generateCommand();
                    });
                };

                /**
                 * Edit property
                 */
                scope.edit = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/manage-property-arg.html'),
                        controller: 'ManagePropertyCtrl',
                        windowClass: 'modal-prop',
                        size: 'lg',
                        resolve: {
                            options: function () {
                                return {
                                    type: 'arg',
                                    name: scope.name,
                                    property: scope.prop,
                                    properties: scope.properties
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(result) {

                        _.each(result.prop, function(value, key) {
                            scope.prop[key] = value;
                        });

                        Data.generateCommand();
                    });

                };

                /**
                 * Handle actions initiated from the property header
                 *
                 * @param action
                 */
                scope.handleAction = function(action) {

                    if (typeof scope[action] === 'function') {
                        scope[action]();
                    }
                };

            }
        };
    }]);