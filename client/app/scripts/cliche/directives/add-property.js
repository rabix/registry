/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('addProperty', ['$templateCache', '$modal', '$document', function ($templateCache, $modal, $document) {

        return {
            restrict: 'E',
            replace: true,
            template: '<a href ng-click="addItem($event)" class="btn btn-default"><i class="fa fa-plus"></i></a>',
            scope: {
                type: '@',
                properties: '='
            },
            link: function(scope) {

                var isOpen = false;

                /**
                 * Show the modal for adding property items
                 *
                 * @param e
                 */
                scope.addItem = function(e) {

                    e.stopPropagation();

                    if (isOpen) { return false; }

                    isOpen = true;

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/add-property-' + scope.type + '.html'),
                        controller: 'AddPropertyCtrl',
                        windowClass: 'modal-prop',
                        size: 'lg',
                        resolve: {
                            options: function () {
                                return {
                                    type: scope.type,
                                    properties: scope.properties
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function() {
                        isOpen = false;
                    }, function() {
                        isOpen = false;
                    });
                };

                /**
                 * Catch the space key down in order to open modal
                 *
                 * @param e
                 */
                var keyHandler = function(e) {
                    if (e.keyCode === 32) { scope.addItem(e); }
                };

                $document.bind('keydown', keyHandler);

                scope.$on('$destroy', function() {
                    $document.unbind('keydown', keyHandler);
                });

            }
        };
    }]);