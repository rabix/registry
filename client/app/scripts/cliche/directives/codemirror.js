/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('CodeMirrorCtrl', ['$scope', '$element', '$timeout', 'SandBox', function ($scope, $element, $timeout, SandBox) {

        var mirror;

        $scope.view = {};
        $scope.view.result = '';
        $scope.view.error = '';

        $scope.view.defaultResult = true;

        var timeoutId = $timeout(function () {

            mirror = CodeMirror($element[0].querySelector('.codemirror-editor'), {
                lineNumbers: true,
                value: $scope.code,
                mode:  'javascript',
                theme: 'mbo'
            });

        }, 100);

        /**
         * Execute the code and show the result
         */
        $scope.execute = function () {

            $scope.view.defaultResult = false;

            var code = mirror.getValue();

            SandBox.evaluate(code, {$self: $scope.arg})
                .then(function (result) {

                    $scope.view.result = result;
                    $scope.view.error = '';

                }, function (error) {

                    $scope.view.result = '';
                    $scope.view.error = error;

                });
        };

        /**
         * Load expression to the particular input/output/argument/whatever
         */
        $scope.load = function () {

            var code = mirror.getValue();

            SandBox.evaluate(code, {$self: $scope.arg})
                .then(function () {

                    $scope.handleLoad({expr: code});

                }, function (error) {

                    if (!$scope.view.firstTry) {

                        $scope.view.firstTry = true;

                        $scope.view.result = '';
                        $scope.view.error = error;

                    } else {
                        $scope.handleLoad({expr: code});
                    }


                });
        };

        /**
         * Cancel expression edit
         */
        $scope.cancel = function () {
            $scope.handleCancel();
        };

        /**
         * Cancel expression edit and clear it
         */
        $scope.clear = function () {
            $scope.handleClear();
        };

        $scope.$on('$destroy', function () {
            SandBox.terminate();
            if (angular.isDefined(timeoutId)) {
                $timeout.cancel(timeoutId);
                timeoutId = undefined;
            }
        });

    }])
    .directive('codemirror', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/cliche/partials/codemirror.html'),
            scope: {
                code: '=',
                arg: '=',
                handleLoad: '&',
                handleCancel: '&',
                handleClear: '&'
            },
            controller: 'CodeMirrorCtrl',
            link: function() {}
        };
    }]);