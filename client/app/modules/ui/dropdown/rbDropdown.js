'use strict';

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
         * @param {expression} name label of dropdown button, can be two way binded, can pass in a string: name="'Some name'"
         * @param {boolean=} intention If present, sets button intention oneOf=['danger', 'primary', 'default', 'warning', 'info', 'success'].
         * @param {expression=} ng-disabled En/Disable based on the expression
         * @param {string=} type Dropdown type, oneOf: ['split', 'default']. Default value is 'default'
         * @param {string=} class Space separated additional classes to add to element
         *
         * @usage
         *
         *  <!-- Simple dropdown, name can be two way binded from parent ctrl -->
         *  <rb-dropdown intention="primary" name="view.dropdown">
         *    <ul>
         *        <li>Item 1</li>
         *        <li>Item 2</li>
         *        <li>Item 3</li>
         *    </ul>
         *  </rb-dropdown>
         *
         *  <!-- Split button dropdown -->
         *  <rb-dropdown intention="primary" type="split" name="'Split dropdown'">
         *    <ul>
         *        <li>Item 1</li>
         *        <li>Item 2</li>
         *        <li>Item 3</li>
         *    </ul>
         *  </rb-dropdown>
         *
         *  <!-- Disabled dropdown -->
         *  <rb-dropdown intention="primary" type="split" name="'Disabled'" ng-disabled="true">
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
            
            console.log(scope.ngDisabled);
            scope.view = {};
            scope.view.name = scope.name || 'Button Dropdown';

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

        function compile(elem, attr) {
            var intention = attr.intention || 'default';

            elem.find('rb-button').attr('intention', intention);

            return {
                post: postLink
            }
        }

        return {
            restrict: 'E',
            template: getTemplate,
            replace: true,
            transclude: true,
            scope: {
                name: '=?',
                ngDisabled: '=?ngDisabled'
            },
            compile: compile
        };
}]);
