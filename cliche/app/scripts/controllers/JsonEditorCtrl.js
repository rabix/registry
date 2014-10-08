'use strict';

angular.module('clicheApp')
    .controller('JsonEditorCtrl', ['$scope', '$modalInstance', '$timeout', 'options', function($scope, $modalInstance, $timeout, options) {

        $scope.view = {};
        $scope.view.user = options.user;

        var mirror;

        var timeoutId = $timeout(function () {

            mirror = CodeMirror(document.querySelector('.codemirror-editor'), {
                lineNumbers: true,
                value: '{}',
                mode:  'javascript',
                theme: 'mbo'
            });

        }, 100);

        /**
         * Do the app import
         */
        $scope.import = function() {

            var json = mirror.getValue();

            $modalInstance.close(json);
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
