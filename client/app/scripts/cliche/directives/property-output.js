/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyOutput', ['$templateCache', '$modal', '$compile', 'Data', function ($templateCache, $modal, $compile, Data) {

        return {
            restrict: 'E',
            template: '<div class="property-box" ng-class="{active: active}"></div>',
            scope: {
                name: '@',
                prop: '=ngModel',
                active: '=',
                req: '=',
                properties: '='
            },
            link: function(scope, element) {

                scope.view = {};

                scope.req = scope.req || [];
                scope.view.required = _.contains(scope.req, scope.name);

                /**
                 * Transform meta into string
                 *
                 * @returns {string}
                 */
                var transformMeta = function() {

                    var value;
                    var meta = [];

                    if (scope.prop.adapter) {
                        _.each(scope.prop.adapter.meta, function(v, k) {
                            if (k !== '__inherit__') {
                                value = v.expr ? v.expr.value : v;
                                meta.push(k + ': ' + value);
                            }
                        });
                    }

                    return meta.join(', ');
                };

                /* init transform */
                scope.view.meta = transformMeta();

                /**
                 * Compile appropriate template
                 */
                var compileTpl = function() {

                    var template = $templateCache.get('views/cliche/property/property-output-' + scope.prop.type  + '.html');

                    var $box = angular.element(element[0].querySelector('.property-box'));
                    var $header = $box[0].querySelector('.property-box-header');
                    var $body = $box[0].querySelector('.property-box-body');

                    if ($header) { angular.element($header).remove(); }
                    if ($body) { angular.element($body).remove(); }

                    $box.append(template);

                    $compile($box.contents())(scope);
                };

                /* init compile */
                compileTpl();

                /**
                 * Toggle property box visibility
                 */
                scope.toggle = function() {
                    scope.active = !scope.active;
                };

                /**
                 * Edit property
                 */
                scope.edit = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/manage-property-output.html'),
                        controller: 'ManagePropertyCtrl',
                        windowClass: 'modal-prop',
                        size: 'lg',
                        resolve: {
                            options: function () {
                                return {
                                    type: 'output',
                                    name: scope.name,
                                    property: scope.prop,
                                    properties: scope.properties,
                                    required: scope.view.required
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(result) {

                        var oldType = scope.prop.type;

                        _.each(result.prop, function(value, key) {
                            scope.prop[key] = value;
                        });

                        scope.view.required = result.required;
                        scope.view.meta = transformMeta();

                        if (result.required && !_.contains(scope.req, scope.name)) {
                            scope.req.push(scope.name);
                        } else {
                            _.remove(scope.req, function(key) { return key === scope.name; });
                        }

                        if (oldType !== result.prop.type) { compileTpl(); }

                        Data.generateCommand();

                    });

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
                        Data.deleteProperty('output', scope.name, scope.properties);
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