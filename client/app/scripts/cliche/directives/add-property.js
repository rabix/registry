/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('addProperty', ['$templateCache', '$modal', function ($templateCache, $modal) {

        return {
            restrict: 'E',
            replace: true,
            template: '<a href ng-click="addItem($event)" class="btn btn-default"><i class="glyphicon glyphicon-plus"></i></a>',
            scope: {
                type: '@',
                properties: '='
            },
            link: function(scope) {

                /**
                 * Show the modal for adding property items
                 *
                 * @param e
                 */
                scope.addItem = function(e) {

                    e.stopPropagation();

                    $modal.open({
                        template: $templateCache.get('views/cliche/partials/add-property-' + scope.type + '.html'),
                        controller: 'AddPropertyCtrl',
                        windowClass: 'modal-prop',
                        resolve: {
                            options: function () {
                                return {
                                    type: scope.type,
                                    properties: scope.properties
                                };
                            }
                        }
                    });
                };

            }
        };
    }]);