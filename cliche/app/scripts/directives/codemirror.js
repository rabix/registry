'use strict';

angular.module('clicheApp')
    .directive('codemirror', ['$timeout', '$templateCache', 'JSandbox', function ($timeout, $templateCache, JSandbox) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/codemirror.html'),
            scope: {
                code: '=',
                arg: '=',
                handleLoad: '&'
            },
            link: function(scope, element) {

                var mirror;

                scope.view = {};
                scope.view.result = '';

                var timeoutId = $timeout(function () {

                    mirror = CodeMirror(element[0].querySelector('.codemirror-editor'), {
                        lineNumbers: true,
                        value: scope.code,
                        mode:  'javascript',
                        theme: 'mbo'
                    });

                }, 100);

                scope.execute = function () {

                    //TODO: run sandbox eval
                    var code = mirror.getValue();

                    console.log(code);

                    JSandbox.eval(
                        code,
                        function (result) {
                            console.log('result', result);
                            scope.view.result = result;
                        },
                        function (error) {
                            console.log('error', error);
                        });

                };

                scope.load = function () {

                    var code = mirror.getValue();

                    //TODO: evaluate with sandbox.eval and if ok pass it to ExpressionCtrl

                    scope.handleLoad({code: code});
                };

                scope.$on('$destroy', function () {
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                });

            }
        };
    }]);