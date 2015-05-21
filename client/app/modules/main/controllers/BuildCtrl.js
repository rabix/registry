'use strict';

angular.module('registryApp')
    .controller('BuildCtrl', ['$scope', '$stateParams', '$interval', '$document', '$timeout', 'Build', 'Sidebar', 'Loading', function ($scope, $stateParams, $interval, $document, $timeout, Build, Sidebar, Loading) {

        var logIntervalId;
        var scrollTimeoutId;

        Sidebar.setActive('builds');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.build = null;

        $scope.view.classes = ['page', 'build'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /* get the build details */
        Build.getBuild($stateParams.id).then(function(result) {
            var build = result.data;
            $scope.view.build = result.data;

            $scope.view.log = [];
            $scope.view.contentLength = 0;

            console.log('Get build, ', result);
            /* start lo(n)g polling if build is running */
            if (build.status === 'running') {

                console.log('lo(n)g polling started');

                $scope.view.loading = false;

                logIntervalId = $interval(function() {
                    Build.getLog($stateParams.id, $scope.view.contentLength).then(logLoaded);
                }, 2000);

            } else {
                /* other than that take the log for the current build */
                Build.getLog($stateParams.id, 0).then(function(res) {
                    var result = res.content;
                    $scope.view.loading = false;
                    $scope.view.log = $scope.view.log.concat(result.content.split('\n'));
                });
            }
        });

        /**
         * Callback when log for the build is loaded
         *
         * @param data
         */
        var logLoaded = function(data) {
            var result = data.content;

            if (result.status !== 'running') {
                $scope.stopLogInterval();
            }

            $scope.view.build.status = result.status;

            if (result.contentLength > 0) {

                $scope.view.log = _.union($scope.view.log, result.content.split('\n'));
                $scope.view.contentLength = parseInt(result.contentLength, 10);
                console.log('lo(n)g polling at ', $scope.view.contentLength);

                $scope.stopScrollTimeout();

                var logContainer = $document[0].getElementById('log-content');
                scrollTimeoutId = $timeout(function () {
                    logContainer.scrollTop = logContainer.scrollHeight;
                }, 100);
            }

        };

        /**
         * Stop the lo(n)g polling
         */
        $scope.stopLogInterval = function() {
            if (angular.isDefined(logIntervalId)) {
                $interval.cancel(logIntervalId);
                logIntervalId = undefined;
                console.log('lo(n)g polling canceled');
            }
        };


        /**
         * Stop the scroll timeout
         */
        $scope.stopScrollTimeout = function() {
            if (angular.isDefined(scrollTimeoutId)) {
                $timeout.cancel(scrollTimeoutId);
                scrollTimeoutId = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.stopLogInterval();
            $scope.stopScrollTimeout();
        });


    }]);
