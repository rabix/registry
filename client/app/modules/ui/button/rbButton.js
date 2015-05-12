'use strict';

angular.module('registryApp.ui')
    .directive('rbButton', ['$templateCache', function($templateCache) {

        function isAnchor(attr) {
            return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink) || angular.isDefined(attr.uiSref);
        }

        function getTemplate(element, attr) {
            return isAnchor(attr) ?
                $templateCache.get('modules/ui/button/views/anchor-button.html') :
                $templateCache.get('modules/ui/button/views/button.html');
        }

        return {
            restrict: 'EA',
            template: getTemplate,
            transclude: true,
            scope: {
                // intention: oneOf: ['warning', 'success', 'primary', 'danger', 'default']
                intention: '@',
                // type: 'submit' or no value
                type: '@'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function (scope, elem, attr) {
                var button = elem.children();

                scope.intention = scope.intention || 'default';
                button.addClass('btn-' + scope.intention);

                if (scope.type) {
                    button.attr('type', scope.type);
                }
            }
        }
    }]);