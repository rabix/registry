/**
 * Author: Milica Kadic
 * Date: 12/02/14
 * Time: 3:58 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('propertyHeaderScript', ['$templateCache', function ($templateCache) {
        return {
            template: $templateCache.get('views/cliche/property/property-header-script.html'),
            scope: {
                name: '@',
                type: '@',
                mode: '@',
                itemType: '@',
                isRequired: '=',
                minItems: '=',
                maxItems: '=',
                enum: '=',
                handle: '&'
            },
            controller: ['$scope', function ($scope) {

                $scope.view = {};

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
                $scope.edit = function(e) {

                    stopPropagation(e);

                    $scope.handle({action: 'edit'});
                };

                /**
                 * Trigger remove handler
                 *
                 * @param e
                 */
                $scope.remove = function(e) {

                    stopPropagation(e);

                    $scope.handle({action: 'remove'});
                };

            }],
            link: function() {}
        };
    }]);