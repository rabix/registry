'use strict';

angular.module('clicheApp')
    .directive('codemirror', ['$timeout', '$templateCache', function ($timeout, $templateCache) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/codemirror.html'),
            scope: {
                code: '=',
                handleLoad: '&'
            },
            link: function(scope, element) {

                var mirror;

                scope.view = {};
                scope.view.result = '';

                $timeout(function () {

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

                    scope.view.result = code;

                };

                scope.load = function () {

                    var code = mirror.getValue();

                    //TODO: evaluate with sandbox.eval and if ok pass it to ExpressionCtrl

                    scope.handleLoad({code: code});
                };

            }
        };
    }]);