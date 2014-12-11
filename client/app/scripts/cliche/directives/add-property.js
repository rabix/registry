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
            template: '<a href ng-click="addItem($event)" class="btn btn-default"><i class="fa fa-plus"></i></a>',
            scope: {
                type: '@',
                openOnKeypress: '@',
                properties: '=',
                req: '=',
                handler: '&'
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
                        template: $templateCache.get('views/cliche/partials/manage-property-' + scope.type + '.html'),
                        controller: 'ManagePropertyCtrl',
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

                    modalInstance.result.then(function(result) {
                        isOpen = false;

                        if (result.required) { scope.req.push(result.name); }

                        if (typeof scope.handler === 'function') { scope.handler(); }

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
                    if (e.keyCode === 65 && e.shiftKey) { scope.addItem(e); }
                };

                if (scope.openOnKeypress) {
                    $document.bind('keydown', keyHandler);
                }

                scope.$on('$destroy', function() {
                    $document.unbind('keydown', keyHandler);
                });

            }
        };
    }]);