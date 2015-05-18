/**
 * @ngdoc module
 * @name registryApp.ui
 * @description
 *
 * Rabix Dropdown Button
 */
angular.module('registryApp.ui')
    .directive('rbDropdown', ['$templateCache', function($templateCache) {

        /**
         * @ngdoc directive
         * @name rbDropdown
         * @module registryApp.ui
         *
         * @restrict E
         *
         * @description
         * `<rb-dropdown>` is a dropdown button directive.
         *
         * Default button look is 'default'
         *
         * @param {expression=} name label of dropdown button, can be two way binded, can pass in a string: name="'Some name'"
         * @param {expression=} ng-disabled En/Disable based on the expression
         *
         * @usage
         *  <rb-dropdown>
         *    <ul>
         *        <li>Item 1</li>
         *        <li>Item 2</li>
         *        <li>Item 3</li>
         *    </ul>
         *  </rb-dropdown>
         */

        function getTemplate(element, attr) {
            var tpl,
                type = attr.type || 'default',
                possible = ['default', 'split'];

            if ( possible.indexOf(type) === -1) {
                console.error('Invalid type passed for button dropdown. Got: %s' , type);
                type = 'default';
            }

            tpl = type + '.html';

            return $templateCache.get('modules/ui/dropdown/' + tpl);
        }

        function postLink(scope, element, attr, ctrl, transcludeFn) {
            var dropdown = element,
                transclusionScope;

            scope.view = {};
            scope.view.name = scope.name || 'Button Dropdown';
            scope.view.intention = attr.intention || 'default';
            scope.view.disabled = scope.ngDisabled || scope.disabled || false;

            transcludeFn(function (clone, scope) {

                if ( !clone.length ) {
                    clone.remove();
                    scope.$destroy();
                    return;
                }

                clone.addClass('dropdown-menu');
                clone.attr('role', 'menu');

                dropdown.append(clone);

                transclusionScope = scope;
            });

            dropdown
                .on('remove', function() {
                    scope.$destroy();
                    transclusionScope.$destroy();
                })
                .on('focus', function() {
                    dropdown.addClass('rb-focused');
                    dropdown.trigger('focus');
                })
                .on('blur', function() {
                    dropdown.removeClass('rb-focused');
                    dropdown.children().trigger('blur');
                });
        }

        return {
            restrict: 'E',
            template: getTemplate,
            replace: true,
            transclude: true,
            scope: {
                name: '=?',
                ngDisabled: '=?',
                disabled: '=?'
            },
            link: postLink
        };
}]);
