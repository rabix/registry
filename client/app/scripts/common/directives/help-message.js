/**
 * Created by Maya on 27.3.15.
 */
'use strict';

angular.module('registryApp.common')
    .directive('helpMessage', [function() {
        return {
            scope: {
                message: '='
            },
            restrict: 'E',
            replace: true,
            template:   '<div class="help-message">' +
                            '<i ng-if="showButton" class="fa fa-question help-button"></i>' +
                            '<help-message-popover></help-message-popover>' +
                        '</div>',
            link: function(scope, element) {

                scope.showButton = !_.isEmpty(scope.message);
                scope.showPopup = false;

                function handler () {
                    scope.showPopup = !scope.showPopup;
                    scope.$apply();
                }

                angular.element(element).on('click', '.help-button', handler);

                scope.$on('$destroy', function() {
                    angular.element(element).off('click', '.help-button', handler);
                });
            }
        };
    }])
    .directive('helpMessagePopover', ['$templateCache', '$document', function ($templateCache, $document) {
        return {
            restrict: 'EA',
            replace: true,
            template: $templateCache.get('views/partials/help-message-popover.html'),
            link: function(scope) {
                function closeHandler (e) {
                    var target = $(e.target);

                    // hide popover only if click is outside help message directive
                    if (scope.showPopup && target.parents('.help-message').length === 0) {
                        scope.showPopup =  false;
                        scope.$apply();
                    }
                }

                // remove event listener when popover isn't visible
                scope.$watch('showPopup', function(n) {
                    if (n) {
                        $document.on('click', closeHandler);
                    } else {
                        $document.off('click', closeHandler);
                    }
                });
            }
        };
    }]);