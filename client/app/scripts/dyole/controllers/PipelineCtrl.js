/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$rootScope', '$routeParams', '$element', '$location', '$window', '$timeout', 'pipeline', 'App', 'rawPipeline', 'Pipeline', function ($scope, $rootScope, $routeParams, $element, $location, $window, $timeout, pipeline, App, rawPipeline, PipelineMdl) {

        var Pipeline;
        var selector = '.pipeline';
        var timeoutId;

        $scope.view = {};


        if (Object.keys($scope.pipeline).length !== 0 || $routeParams.mode === 'new') {
            Pipeline = pipeline.getInstance({
                model: $scope.pipeline ? $scope.pipeline.json || rawPipeline : rawPipeline,
                $parent: angular.element($element[0].querySelector(selector)),
                editMode: $scope.editMode
            });

            console.log('Pipeline loaded imidiatly', $scope.editMode);
        } else {
            var pipelineWatch = $scope.$watch('pipeline', function(n, o) {

                if (n !== o) {

                    Pipeline = pipeline.getInstance({
                        model: $scope.pipeline ? $scope.pipeline.json || rawPipeline : rawPipeline,
                        $parent: angular.element($element[0].querySelector(selector)),
                        editMode: $scope.editMode
                    });

                    pipelineWatch();

                    console.log('Pipeline loaded after watch', $scope.editMode);

                }
            });
        }


        /**
         * Save pipeline
         */
        $scope.$on('save', function (e, value) {

            if (value) {

                $scope.pipeline.json = Pipeline.getJSON();

                PipelineMdl.save($scope.pipeline._id, $scope.pipeline)
                    .then(function (data) {

                        if (data.id) {
                            $location.path('/pipeline/' + data.id);
                        } else {
                            $scope.pipelineChangeFn({value: false});
                        }
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
        var cancelSidebarToggleEL = $rootScope.$on('sidebar:toggle', function () {

            cancelTimeout();

            timeoutId = $timeout(function () {
                Pipeline.adjustSize();
            }, 300);

        });

        /**
         * Track pipeline change
         */
        var cancelPipelineChangeEL = $rootScope.$on('pipeline:change', function (e, value) {
            $scope.pipelineChangeFn({value: true});
        });

        $scope.$on('$destroy', function() {

            angular.element($window).off('resize', lazyChangeWidth);

            cancelTimeout();
            cancelSidebarToggleEL();
            cancelPipelineChangeEL();
        });




    }]);
