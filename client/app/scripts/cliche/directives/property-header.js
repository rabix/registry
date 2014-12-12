/**
 * Author: Milica Kadic
 * Date: 12/02/14
 * Time: 3:58 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyHeader', ['$templateCache', function ($templateCache) {
        return {
            template: $templateCache.get('views/cliche/property/property-header.html'),
            scope: {
                order: '=',
                name: '@',
                type: '@',
                itemType: '@',
                isRequired: '@',
                handle: '&'
            },
            link: function(scope) {

                scope.view = {};
                scope.view.order = scope.order || 0;

                /* watch for order to change */
                scope.$watch('order', function(n, o) {
                    if (n !== o) {
                        scope.view.order = n || 0;
                    }
                });

                /**
                 * Stop propagation
                 *
                 * @param e
                 */
                var stopPropagation = function(e) {

                    if (typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                    }
                    if (typeof e.cancelBubble !== 'undefined') {
                        e.cancelBubble = true;
                    }

                };

                /**
                 * Trigger edit handler
                 *
                 * @param e
                 */
                scope.edit = function(e) {

                    stopPropagation(e);

                    scope.handle({action: 'edit'});
                };

                /**
                 * Trigger remove handler
                 *
                 * @param e
                 */
                scope.remove = function(e) {

                    stopPropagation(e);

                    scope.handle({action: 'remove'});
                };

                /**
                 * Trigger toggle handler
                 */
                scope.toggle = function() {

                    scope.handle({action: 'toggle'});

                };

            }
        };
    }]);