/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$rootScope', '$routeParams', '$element', '$location', '$window', '$timeout', '$injector', 'pipeline', 'App', 'rawPipeline', 'Pipeline', '$modal', '$templateCache', function ($scope, $rootScope, $routeParams, $element, $location, $window, $timeout, $injector, pipeline, App, rawPipeline, PipelineMdl, $modal, $templateCache) {

        var Pipeline;
        var selector = '.pipeline';
        var timeoutId;

        $scope.view = {};
        $scope.view.canFlush = _.contains(['new', 'edit'], $routeParams.mode);

        /* show usage hints to user flag */
        $scope.view.explanation = false;
        $scope.view.reload = false;


        /**
         * Initialize pipeline
         */
        var initPipeline = function (obj) {

            if (!obj.json || obj.json.nodes.length === 0) {
                $scope.view.explanation = true;
            }

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
        } else if ($scope.pipeline && Object.keys($scope.pipeline).length !== 0){
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
        $scope.$on('save', function (e, repoId) {

            if (repoId) {
                $scope.pipeline.repo = repoId;
            }

            $scope.pipeline.json = Pipeline.getJSON();

            PipelineMdl.savePipeline($scope.pipeline.pipeline ? $scope.pipeline.pipeline._id : '', $scope.pipeline)
                .then(function (data) {

                    if (data.id) {
                        if (repoId) {
                            $location.path('/pipeline/' + data.id);
                        } else {
                            $scope.view.reload = true;
                            $location.path('/pipeline/' + data.id + '/edit');
                        }
                    } else {
                        $scope.pipelineChangeFn({value: false});
                    }
                });

        });
        
        $scope.$on('pipeline:fork', function (e, repoId) {
            $scope.pipeline.json = Pipeline.getJSON();

            $scope.pipeline.repo = repoId;

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

        $scope.$on('pipeline:format', function () {
            PipelineMdl.formatPipeline(Pipeline.getJSON()).then(function (pipeline) {
                console.log(pipeline);
                $scope.handlePipelineJson({pipeline: pipeline.json});
            });
        });

        /**
         * Drop node on the canvas
         *
         * @param {MouseEvent} e
         * @param {String} id
         */
        $scope.dropNode = function(e, id) {

            $scope.view.loading = true;
            $scope.view.explanation = false;

            App.getRevision(id).then(function(result) {

                $scope.view.loading = false;
                console.log(result.data);

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

        /**
         * Track route change in order to prevent loss of changes
         *
         * @param e
         * @param nextLocation
         */
        var onRouteChange = function(e, nextLocation) {
            console.log('$scope.view.reload', $scope.view.reload);
            if($scope.view.reload) { return; }

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-leave.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () {return {};}}
            });

            modalInstance.result.then(function () {

                onRouteChangeOff();

                $scope.view.reload = true;

                if ($routeParams.mode === 'new') { $scope.$broadcast('save-local', true); }

                $location.path(nextLocation.split('#\/')[1]);

            });

            e.preventDefault();

        };

        var onNodeInfoOff = $rootScope.$on('node:info', onNodeInfo);
        var onNodeLabelEditOff = $rootScope.$on('node:label:edit', onNodeLabelEdit);
        var onRouteChangeOff = $rootScope.$on('$locationChangeStart', onRouteChange);

        $scope.$on('$destroy', function() {

            angular.element($window).off('resize', lazyChangeWidth);

            cancelTimeout();
            onSidebarToggleOff();
            onPipelineChangeOff();
            onNodeInfoOff();
            onNodeLabelEditOff();

            onRouteChangeOff();

        });




    }]);
