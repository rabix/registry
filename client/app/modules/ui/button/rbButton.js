'use strict';

/**
 * @ngdoc module
 * @name registryApp.ui
 * @description
 *
 * Rabix Button
 */
angular.module('registryApp.ui')
    .directive('rbButton', ['$templateCache', function($templateCache) {

        /**
         * @ngdoc directive
         * @name rbButton
         * @module registryApp.ui
         *
         * @restrict EA
         *
         * @description
         * `<rb-button>` is a button directive with optional types.
         *
         * If you supply a `href`, `ng-href` or 'ui-sref' attribute, it will become an `<a>` element. Otherwise, it will
         * become a `<button>` element.
         *
         * On button focus class `rb-focus` will be applied and removed when focus is lost
         *
         * Default button look is 'default'
         *
         * @param {boolean=} intention If present, sets button intention oneOf=['danger', 'primary', 'default', 'warning', 'info', 'success'].
         * @param {expression=} ng-disabled En/Disable based on the expression
         * @param {string=} type Button type
         * @param {string=} class Space separated additional classes to add to element
         * @param {string=} aria-label Adds alternative text to button for accessibility, useful for icon buttons. // TODO: needs implementing
         *
         * @usage
         *  <rb-button>
         *    Flat Button
         *  </rb-button>
         *  <rb-button type='submit'>
         *    Submit Button
         *  </rb-button>
         *  <rb-button href="http://google.com">
         *    Flat link
         *  </rb-button>
         *  <rb-button ng-disabled="true">
         *    Disabled Button
         *  </rb-button>
         */
        function isAnchor(attr) {
            return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink) || angular.isDefined(attr.uiSref);
        }

        function getTemplate(element, attr) {
            return isAnchor(attr) ?
                '<a class="btn rb-button" ng-transclude></a>' :
                '<button type="button" class="btn rb-button" ng-transclude></button>';
        }

        function postLink(scope, element, attr, ctrl, transcludeFn) {
            var button = element;

            var intention = attr.intention || 'default';

            button.addClass('btn-' + intention);

            // check for disabled prop on click
            element.on('click', function(e){
                if (attr.disabled === true) {
                    return false;
                }
            });

            // add focus class and remove it
            button
                .on('focus', function() {
                    element.addClass('rb-focused');
                })
                .on('blur', function() {
                    element.removeClass('rb-focused');
                });
        }

        return {
            restrict: 'EA',
            template: getTemplate,
            replace: true,
            transclude: true,
            link: postLink
        };
    }]);