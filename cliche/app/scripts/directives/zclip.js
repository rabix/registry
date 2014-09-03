'use strict';

angular.module('clicheApp')
    .directive('zclip', ['$templateCache', '$timeout', 'Data', function ($templateCache, $timeout, Data) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/zclip.html'),
            scope: {
                data: '@'
            },
            link: function(scope, element) {

                scope.view = {};

                var $element = element[0].querySelector('.btn');
                var clip = new ZeroClipboard($element);
                var timeoutId;

                clip.on('ready', function() {

                    clip.on('copy', function (event) {
                        var clipboard = event.clipboardData;
                        var content = scope.data === 'command' ? Data[scope.data] : JSON.stringify(Data[scope.data]);
                        clipboard.setData('text/plain', content);
                        scope.view.trace = 'Wait...';
                        scope.$apply();
                    });

                    clip.on('aftercopy', function () {
                        scope.view.trace = 'Data is copied to your clipboard';
                        scope.clearTimeout();
                        timeoutId = $timeout(function() {
                            scope.view.trace = '';
                        }, 3000);
                        scope.$apply();
                    });

                    clip.on('error', function() {
                        ZeroClipboard.destroy();
                    });
                });

                scope.$on('$destroy', function() {
                    scope.clearTimeout();
                    clip.destroy();
                });

                scope.clearTimeout = function() {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                };

            }
        };
    }]);