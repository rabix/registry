/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$rootScope', '$element', '$http', '$window', '$timeout', 'pipeline', 'App', 'rawPipeline', 'Pipeline', function ($scope, $rootScope, $element, $http, $window, $timeout, pipeline, App, rawPipeline, PipelineMdl) {

        var Pipeline;
        var selector = '.pipeline';
        var timeoutId;

        $scope.view = {};


        Pipeline = pipeline.getInstance({
            model: rawPipeline,
            $parent: angular.element($element[0].querySelector(selector))
        });

        /**
         * Save pipeline
         */
        $scope.$watch('save', function (n, o) {

            if (n !== o && n) {
                PipelineMdl.save($scope.pipeline._id, Pipeline.getJSON()).then(function (data) {
                    console.log(data);
                    $scope.save = false;
                });

            }

        });

        /**
         * Drop node on the canvas
         *
         * @param {MouseEvent} e
         * @param {String} id
         */
        $scope.dropNode = function(e, id) {

            $scope.view.loading = true;

            App.getApp(id).then(function(result) {

                $scope.view.loading = false;

                Pipeline.addNode(result.data, e.clientX, e.clientY);

            });

        };

        /**
         * Cancel timeout
         */
        var cancelTimeout = function () {
            if (angular.isDefined(timeoutId)) {
                $timeout.cancel(timeoutId);
                timeoutId = undefined;
            }
        };

        /**
         * Adjust size of the canvas when window size changes
         */
        var changeWidth = function () {
            Pipeline.adjustSize();
        };

        var lazyChangeWidth = _.debounce(changeWidth, 150);

        angular.element($window).on('resize', lazyChangeWidth);

        /**
         * Track sidebar toggle in order to adjust canvas size
         */
        var cancelSidebarToggleEvent = $rootScope.$on('sidebar-toggle', function () {

            cancelTimeout();

            timeoutId = $timeout(function () {
                Pipeline.adjustSize();
            }, 300);

        });

        $scope.$on('$destroy', function() {
            angular.element($window).off('resize', lazyChangeWidth);
            cancelTimeout();
            cancelSidebarToggleEvent();
        });




    }]);
