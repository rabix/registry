'use strict';

angular.module('registryApp.ui')
    .directive('rbButton', [function() {
        return {
            restrict: 'E',
            template: $templateCache.get('modules/common/views/paginator.html'),
            scope: {
                type: '@',
                class: '@',
                onClick: '&'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function (scope, elem, attr) {
                
            }
        }
    }]);