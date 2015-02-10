/**
 * Author: Milica Kadic
 * Date: 11/18/14
 * Time: 14:26 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('copy', ['$templateCache', '$timeout', function ($templateCache, $timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '@',
                isSmall: '@',
                showString: '@'
            },
            template: $templateCache.get('views/partials/copy.html'),
            link: function(scope, element) {

                scope.view = {};
                scope.view.text = 'Copy';
                scope.view.error = '';

                var timeoutId;
                var clipboard;
                var $element = element[0].querySelector('.btn-copy');
                var clip = new ZeroClipboard($element);

                clip.on('ready', function() {

                    clip.on('copy', function (event) {

                        scope.view.copying = true;

                        clipboard = event.clipboardData;
                        clipboard.setData('text/plain', scope.data);

                        scope.$apply();
                    });

                    clip.on('aftercopy', function () {

                        scope.view.text = 'copied';

                        scope.cancelTimeout();

                        timeoutId = $timeout(function() {
                            scope.view.text = 'Copy';
                            scope.view.copying = false;
                        }, 2000);

                        scope.$apply();
                    });

                    clip.on('error', function() {
                        console.log('error');
                        ZeroClipboard.destroy();
                    });

                });

                clip.on('error', function(e) {

                    scope.view.error = e.message;

                    ZeroClipboard.destroy();

                    scope.$apply();
                });

                scope.cancelTimeout = function() {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

                scope.$on('$destroy', function() {
                    clip.destroy();
                    scope.cancelTimeout();
                });

            }
        };
    }]);