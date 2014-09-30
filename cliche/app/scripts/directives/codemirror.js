'use strict';

angular.module('clicheApp')
    .directive('codemirror', ['$timeout', '$templateCache', 'SandBox', function ($timeout, $templateCache, SandBox) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/codemirror.html'),
            scope: {
                code: '=',
                arg: '=',
                handleLoad: '&',
                handleCancel: '&',
                handleClear: '&'
            },
            link: function(scope, element) {

                var mirror;

                scope.view = {};
                scope.view.result = '';
                scope.view.error = '';

                var timeoutId = $timeout(function () {

                    mirror = CodeMirror(element[0].querySelector('.codemirror-editor'), {
                        lineNumbers: true,
                        value: scope.code,
                        mode:  'javascript',
                        theme: 'mbo'
                    });

                }, 100);

                /**
                 * Execute the code and show the result
                 */
                scope.execute = function () {

                    var code = mirror.getValue();

                    SandBox.evaluate(code, {$self: scope.arg})
                        .then(function (result) {

                            scope.view.result = result;
                            scope.view.error = '';

                        }, function (error) {

                            scope.view.result = '';
                            scope.view.error = error;

                        });
                };

                /**
                 * Load expression to the particular input/output/argument/whatever
                 */
                scope.load = function () {

                    var code = mirror.getValue();

                    SandBox.evaluate(code, {$self: scope.arg})
                        .then(function () {

                            scope.handleLoad({expr: code});

                        }, function (error) {

                            scope.view.result = '';
                            scope.view.error = error;

                        });
                };

                /**
                 * Cancel expression edit
                 */
                scope.cancel = function () {
                    scope.handleCancel();
                };

                /**
                 * Cancel expression edit and clear it
                 */
                scope.clear = function () {
                    scope.handleClear();
                };

                scope.$on('$destroy', function () {
                    SandBox.terminate();
                    if (angular.isDefined(timeoutId)) {
                        $timeout.cancel(timeoutId);
                        timeoutId = undefined;
                    }
                });

            }
        };
    }]);