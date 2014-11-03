/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$rootScope', '$routeParams', '$element', '$location', '$window', '$timeout', '$injector', 'pipeline', 'App', 'rawPipeline', 'Pipeline', function ($scope, $rootScope, $routeParams, $element, $location, $window, $timeout, $injector, pipeline, App, rawPipeline, PipelineMdl) {

        var Pipeline;
        var selector = '.pipeline';
        var timeoutId;

        $scope.view = {};
        $scope.view.canFlush = _.contains(['new', 'edit'], $routeParams.mode);

        /**
         * Initialize pipeline
         */
        var initPipeline = function (obj) {

            Pipeline = pipeline.getInstance({
                model: obj ? obj.json || rawPipeline : rawPipeline,
                $parent: angular.element($element[0].querySelector(selector)),
                editMode: $scope.editMode
            });

        };

        if ($routeParams.mode === 'new') {
            PipelineMdl.getLocalPipeline()
                .then(function (json) {
                    initPipeline(json);
                });
        } else {
            initPipeline($scope.pipeline);
        }

        $scope.$watch('pipeline', function(n, o) {
            if (n !== o) {

                $scope.pipeline = n;

                if (angular.isDefined(Pipeline)) {
                    Pipeline.destroy();
                    Pipeline = null;
                }

                initPipeline(n);
            }
        });

        /**
         * Save pipeline
         */
        $scope.$on('save', function (e, value) {

            if (value) {
                $scope.pipeline.json = Pipeline.getJSON();

                PipelineMdl.savePipeline($scope.pipeline._id, $scope.pipeline)
                    .then(function (data) {

                        if (data.id) {
                            $location.path('/pipeline/' + data.id);
                        } else {
                            $scope.pipelineChangeFn({value: false});
                        }
                    });
            }

        });
        
        $scope.$on('pipeline:fork', function () {
            $scope.pipeline.json = Pipeline.getJSON();

            PipelineMdl.fork($scope.pipeline).then(function (pipeline) {
                $location.path('/pipeline/' + pipeline._id + '/edit');
            });
        });

        /**
         * Save pipeline locally
         */
        $scope.$on('save-local', function (e, value) {
            if (value) {
                PipelineMdl.saveLocalPipeline(Pipeline.getJSON());
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

            App.getApp(id, 'public').then(function(result) {

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
        var onSidebarToggleOff = $rootScope.$on('sidebar:toggle', function () {

            cancelTimeout();

            timeoutId = $timeout(function () {
                Pipeline.adjustSize();
            }, 300);

        });

        /**
         * Track pipeline change
         */
        var onPipelineChangeOff = $rootScope.$on('pipeline:change', function () {
            $scope.pipelineChangeFn({value: true});
        });

        /**
         * Set fresh canvas
         */
        $scope.flush = function() {

            if (!$scope.view.canFlush) { return false; }

            PipelineMdl.flush();

            if (angular.isDefined(Pipeline)) {
                Pipeline.destroy();
                Pipeline = null;
                initPipeline({});
            }

        };

        /**
         * Open modal with info for selected node
         *
         * @param e
         * @param model
         */
        var onNodeInfo = function(e, model) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            $modal.open({
                template: $templateCache.get('views/dyole/node-info.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-node',
                resolve: {data: function () { return model; }}
            });

        };

        var onNodeLabelEdit = function(e, name, onEdit, onSave, scope) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            $modal.open({
                template: $templateCache.get('views/dyole/node-label-edit.html'),
                controller: 'NodeEditCtrl',
                windowClass: 'modal-node',
                resolve: {data: function () { return {
                    name: name,
                    onEdit: onEdit,
                    onSave: onSave,
                    scope: scope
                }; }}
            });

        };

        var onNodeInfoOff = $rootScope.$on('node:info', onNodeInfo);
        var onNodeLabelEditOff = $rootScope.$on('node:label:edit', onNodeLabelEdit);

        $scope.$on('$destroy', function() {

            angular.element($window).off('resize', lazyChangeWidth);

            cancelTimeout();
            onSidebarToggleOff();
            onPipelineChangeOff();
            onNodeInfoOff();
            onNodeLabelEditOff();
        });




    }]);
