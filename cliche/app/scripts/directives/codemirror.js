'use strict';

angular.module('clicheApp')
    .directive('codemirror', ['$timeout', '$templateCache', 'SandBox', 'Data', function ($timeout, $templateCache, SandBox, Data) {
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

                    //code.replace(/\$self/gi, scope.arg);
                    console.log(typeof code, code);

                    var input = {
                        $self: scope.arg
                    };

                    SandBox.evaluate( code
                        ,
                        function(res){
                            console.log(res);

                            scope.view.result = res;
                            scope.$digest();
                        },

                        input,

                        function(err){
                            console.log(err);
                            scope.view.result = err;
                            scope.$digest();

                        }
                    );

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