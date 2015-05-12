/**
 * Created by Maya on 12.5.15.
 */
'use strict';

angular.module('registryApp.ui')

    .directive('rbCheckbox', [function() {

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                ngModel: '=',
                ngDisabled: '='
            },
            template: '<div class="checkbox rb-checkbox"><label><input type="checkbox" ng-model="ngModel" ng-disabled="ngDisabled"/><ng-transclude></ng-transclude></label></div>',
            transclude: true,
            link: function (scope, element) {
                element.on('remove', function() {
                    scope.$destroy();
                });
            }
        };
    }]);
