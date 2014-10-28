/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineViewCtrl', ['$scope', '$routeParams', 'Sidebar', 'Loading', 'Pipeline', function ($scope, $routeParams, Sidebar, Loading, Pipeline) {

        Sidebar.setActive('_dyole');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.pipeline = {};

        $scope.view.classes = ['page', 'pipeline-view'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Pipeline.getPipeline($routeParams.id)
            .then(function(result) {
                $scope.view.pipeline = result.data;
                $scope.view.loading = false;
            });

    }]);
