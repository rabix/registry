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
         * @restrict E
         *
         * @description
         * `<rb-input>` is a directive for input fields.
         *
         * Accepts all valid textual input types. No specified input type defaults to 'text'.
         *
         * Transcluded content can be: `<label>`, a `<p>`, or both
         *
         * @param {string} ng-model Model for the input value
         * @param {string=} type Input type, any valid text input type
         * @param {boolean=} ng-required Specifies if field is required
         * @param {boolean=} ng-disabled En/Disable based on the expression
         * @param {boolean=} has-error Adds has-error class based on expression
         * @param {boolean=} clear Clears search field
         * @param {boolean=} no-button Removes search button
         * @param {Function=} callback Callback is called on submit
         *
         * @usage
         *  <rb-input ng-model="model">
         *  </rb-input>
         *
         *  <rb-input type="search" ng-model="model">
         *    <p>
         *      Enter search terms
         *    </p>
         *  </rb-input>
         *
         *  <rb-input type="number" ng-model="number">
         *  </rb-input>
         *
         *  <rb-input ng-disabled="true" ng-model="model">
         *    <label>Disabled Input</label>
         *  </rb-input>
         *
         *
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
                    $(helpBlock).addClass('help-block');
                    element.append(helpBlock);
                }

                transclusionScope = scope;
            });

            scope.clearModel = function()  {
                scope.ngModel = '';
                scope.$digest();
            };

            // add clear button if specified;
            scope.showClear = attr.type === 'search' && (attr.clear === '' || attr.clear === 'true');

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
                ngRequired: '=',
                placeholder: '@',
                hasError: '=',
                callback: '&'
            },
            template: getTemplate,
            compile: function(element, attr) {

                // append type, default to 'text'
                var type = attr.type || 'text';

                element.find('input').attr('type', type);

                if (attr.noButton === '' || attr.noButton === 'true') {
                    element.find('button[type=submit]').remove();
                }

                return postLink;

            }
        };
    }]);