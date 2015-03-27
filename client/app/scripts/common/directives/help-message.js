/**
 * Created by Maya on 27.3.15.
 */
'use strict';

angular.module('registryApp.common')
    .directive('helpMessage', [function() {
        return {
            scope: {
                message: '='
            },
            restrict: 'E',
            template: '<i ng-if="showButton" class="fa fa-question help-button" popover-animation="true" popover-placement="right" popover="{{ ::message }}"></i>',
            link: function(scope) {
                scope.showButton = !_.isEmpty(scope.message);
            }
        };
    }]);