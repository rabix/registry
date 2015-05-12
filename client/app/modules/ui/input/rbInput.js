/**
 * Created by Maya on 12.5.15.
 */

'use strict';

angular.module('registryApp.ui')
    .directive('rbInput', ['$templateCache', function($templateCache) {

        function getTemplate (element, attr) {
            switch (attr.type) {
                case 'search':
                    return $templateCache.get('modules/ui/input/search.html');
                default:
                    return $templateCache.get('modules/ui/input/default.html');
            }
        }

        function postLink (scope, element, attr, ctrl, transcludeFn) {
            var transclusionScope;

            transcludeFn(function(clone, scope) {

                var label, helpBlock;
                if ( !clone.length ) {
                    clone.remove();
                    scope.$destroy();
                    return;
                }

                label = _.find(clone, {tagName: 'LABEL'});
                helpBlock = _.find(clone, function(elem) {
                    return $(elem).hasClass('help-block');
                });

                if (label) {
                    $(label).addClass('control-label');
                    element.prepend(label);
                }

                if (helpBlock) {
                    element.append(helpBlock);
                }

                transclusionScope = scope;

            });

            element.on('remove', function() {
                scope.$destroy();
                transclusionScope.$destroy();
            });
        }

        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                placeholder: '@',
                hasError: '='
            },
            template: getTemplate,
            compile: function(element, attrs) {

                var type = attrs.type || 'text';
                element.find('input').attr('type', type);

                return postLink;

            }
        };
    }]);