/**
 * Created by Maya on 12.5.15.
 */

'use strict';

angular.module('registryApp.ui')
    .directive('rbInput', ['$templateCache', function($templateCache) {

        /**
         * @ngdoc directive
         * @name rbInput
         * @module registryApp.ui
         *
         * @restrict EA
         *
         * @description
         * `<rb-input>` is a directive for input fields.
         *
         * Accepts all valid textual input types. No specified input type defaults to 'text'.
         *
         * Transcluded content can either be a label, a `<p class="help-block">`, or both
         *
         * @param {expression=} ng-model Model for the input value
         * @param {expression=} ng-disabled En/Disable based on the expression
         * @param {string=} type Input type, any valid text input type
         * @param {expression=} has-error Adds has-error class based on expression
         * @param {string=} classes Space separated additional classes to add to element @todo: implement this!
         * @param {string=} required Specifies if field is required
         *
         * @usage
         *  <rb-input ng-model="model">
         *  </rb-input>
         *
         *  <rb-input type="search">
         *    <p class="help-block">
         *      Enter search terms
         *    </p>
         *  </rb-input>
         *
         *  <rb-input type="number" ng-model="number">
         *  </rb-input>
         *
         *  <rb-input ng-disabled="true">
         *    Disabled Button
         *  </rb-input>
         */

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
                helpBlock = _.find(clone, {tagName: 'P'});

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