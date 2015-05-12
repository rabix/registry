'use strict';

angular.module('registryApp.ui')
    .directive('rbButton', [function() {


        function isAnchor(attr) {
            return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink) || angular.isDefined(attr.uiSref);
        }

        function _getTemplate(element, attr) {
            return isAnchor(attr) ?
                $templateCache.get('modules/ui/views/button/anchor-button.html') :
                $templateCache.get('modules/ui/views/button/button.html');
        }

        return {
            restrict: 'EA',
            template: _getTemplate,
            transclude: true,
            scope: {
                // Boolean
                submit: '@',
                type: '@',
                // space separated classes to add
                class: '@',
                onClick: '&'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function (scope, elem, attr) {
                
            }
        }
    }]);