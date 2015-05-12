'use strict';

angular.module('registryApp.ui')
    .directive('rbButton', ['$templateCache', function($templateCache) {

        function isAnchor(attr) {
            return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink) || angular.isDefined(attr.uiSref);
        }

        function getTemplate(element, attr) {
            return isAnchor(attr) ?
                '<a class="btn rb-button" ng-transclude></a>' :
                '<button class="btn rb-button" ng-transclude></button>';
        }

        return {
            restrict: 'EA',
            template: getTemplate,
            transclude: true,
            link: function (scope, elem, attr) {
                var button = elem.children();

                var intention = attr.intention || 'default';
                var type = attr.type;
                var classes = attr.classes || '';

                button.addClass('btn-' + intention);
                button.addClass(classes);

                if (scope.type) {
                    button.attr('type', type);
                }
            }
        };
    }]);