'use strict';

angular.module('clicheApp')
    .directive('addProperty', ['$templateCache', '$modal', function ($templateCache, $modal) {

        return {
            restrict: 'E',
            replace: true,
            template: '<a href ng-click="addItem($event)" class="btn btn-default"><i class="glyphicon glyphicon-plus"></i></a>',
            scope: {
                type: '@',
                properties: '=',
                platformFeatures: '=',
                valuesFrom: '='
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
                        template: $templateCache.get('views/partials/add-property-' + scope.type + '.html'),
                        controller: 'AddPropertyCtrl',
                        windowClass: 'modal-prop',
                        resolve: {
                            options: function () {
                                return {
                                    type: scope.type,
                                    properties: scope.properties,
                                    platformFeatures: scope.platformFeatures,
                                    valuesFrom: scope.valuesFrom
                                };
                            }
                        }
                    });
                };

            }
        };
    }]);