/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineViewCtrl', ['$scope', '$routeParams', '$http', 'Sidebar', 'Loading', 'Pipeline', function ($scope, $routeParams, $http, Sidebar, Loading, PipelineMdl) {

        Sidebar.setActive('_dyole');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.pipeline = null;

        $scope.view.classes = ['page', 'pipeline'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $http.get('/pipeline-editor/data/clean_pipeline.json')
            .success(function(data) {
                Pipeline.init(data, document.getElementsByClassName('pipeline-editor'), {});
            });

        PipelineMdl.getPipeline($routeParams.id)
            .then(function(result) {
                $scope.view.pipeline = result.data;
                $scope.view.loading = false;
            });

    }]);
