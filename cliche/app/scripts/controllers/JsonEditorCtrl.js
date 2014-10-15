'use strict';

angular.module('clicheApp')
    .controller('JsonEditorCtrl', ['$scope', '$modalInstance', '$timeout', 'options', 'App', function($scope, $modalInstance, $timeout, options, App) {

        $scope.view = {};
        $scope.view.user = options.user;

        var mirror;

        var timeoutId = $timeout(function () {

            mirror = CodeMirror(document.querySelector('.codemirror-editor'), {
                lineNumbers: true,
                value: '',
                mode:  {name: "javascript", json: true},
                theme: 'mbo'
            });

        }, 100);

        /**
         * Check if json is valid
         * @param str
         * @returns {boolean}
         */
        var isJsonString = function (str) {

            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }

            return true;
        };

        /**
         * Do the app import
         */
        $scope.import = function() {

            var json = mirror.getValue();
            $scope.view.error = '';

            if (!isJsonString(json)) {
                $scope.view.error = 'You must provide valid json format';
                return false;
            }

            $scope.view.validating = true;

            App.validateJson(json)
                .then(function () {

                    $scope.view.validating = false;

                    $modalInstance.close(json);

                }, function () {
                    $scope.view.validating = false;
                });


        };

        /**
         * Close the modal window
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('$destroy', function () {
            if (angular.isDefined(timeoutId)) {
                $timeout.cancel(timeoutId);
                timeoutId = undefined;
            }
        });

    }]);
