'use strict';

angular.module('registryApp.ui')
    .directive('rbSelect', [function() {

        /**
         * @ngdoc directive
         * @name rbSelect
         * @module registryApp.ui
         *
         * @restrict E
         *
         * @description
         * `<rb-select>` is a wrapper directive for select and ng-options directives
         *
         * It takes a comprehension expression for `ng-options` in terms of the `options` object, which is passed to the directive via the `options` attribute.
         *
         * Transcluded content can be: `<label>`, `<p>` or both
         *
         * @param {string} ng-model Assignable angular expression to data-bind to
         * @param {comprehension_expression} expression Comprehension expression for options. See [ngOptions directive docs]{@link https://docs.angularjs.org/api/ng/directive/ngOptions}
         * @param {expression} options object or array for options
         * @param {boolean=} ng-required Specifies if field is required
         * @param {boolean=} ng-disabled En/Disable based on the expression
         * @param {boolean=} has-error Adds has-error class based on expression
         *
         * @usage
         * <rb-select ng-model="model" expression="item.key as item.value for item in options" options="someOptionsArray">
         *     <label>
         *         Label for select
         *     </label>
         *     <p>
         *         Help Block text
         *     </p>
         * </rb-select>
         */


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
                    $(helpBlock).addClass('help-block');
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
            restrict: 'E',
            replace: true,
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                ngRequired: '=',
                hasError: '=',
                options: '='
            },
            transclude: true,
            templateUrl: 'modules/ui/select/default.html',
            compile: function (element, attr) {
                element.addClass('rb-select');
                element.find('select').attr('ng-options', attr.expression);

                return postLink;
            }
        };
    }]);