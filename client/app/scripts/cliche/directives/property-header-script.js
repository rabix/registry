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
                enum: '=',
                handle: '&'
            },
            controller: ['$scope', 'Helper', function ($scope, Helper) {

                $scope.view = {};

                /**
                 * Trigger handler for particular action
                 *
                 * @param action
                 * @param e
                 */
                $scope.triggerAction = function(action, e) {

                    Helper.stopPropagation(e);

                    $scope.handle({action: action});

                };

            }],
            link: function() {}
        };
    }]);