'use strict';

angular.module('registryApp')
    .controller('PipelinesCtrl', ['$scope', '$routeParams', 'Pipeline', 'Sidebar', 'Api', 'Loading', 'User',function ($scope, $routeParams, Pipeline, Sidebar, Api, Loading, User) {

        Sidebar.setActive('_dyole');

        /**
         * Callback when pipelines are loaded
         *
         * @param result
         */
        var pipelinesLoaded = function(result) {

            $scope.view.paginator.prev = $scope.view.page > 1;
            $scope.view.paginator.next = ($scope.view.page * $scope.view.perPage) < result.total;
            $scope.view.total = Math.ceil(result.total / $scope.view.perPage);

            $scope.view.pipelines = result.list;
            $scope.view.loading = false;
        };

        User.getUser().then(function (result) {
            $scope.user = result.user;
        });

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.pipelines = [];
        $scope.view.searchTerm = '';

        $scope.view.classes = ['page', 'pipelines'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $scope.view.paginator = {
            prev: false,
            next: false
        };

        $scope.view.page = 1;
        $scope.view.perPage = 25;
        $scope.view.total = 0;

        Pipeline.getPipelines(0).then(pipelinesLoaded);

        /**
         * Go to the next/prev page
         *
         * @param dir
         */
        $scope.goToPage = function(dir) {

            if (!$scope.view.loading) {

                if (dir === 'prev') {
                    $scope.view.page -= 1;
                }
                if (dir === 'next') {
                    $scope.view.page += 1;
                }

                $scope.view.loading = true;
                var offset = ($scope.view.page - 1) * $scope.view.perPage;

                Pipeline.getPipelines(offset, $scope.view.searchTerm).then(pipelinesLoaded);

            }
        };

        /**
         * Search pipelines by the term
         */
        $scope.searchPipelines = function() {

            $scope.view.page = 1;
            $scope.view.loading = true;

            Pipeline.getPipelines(0, $scope.view.searchTerm).then(pipelinesLoaded);

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            Pipeline.getPipelines(0).then(pipelinesLoaded);

        };

        /**
         * Delete pipeline
         */
        $scope.deletePipeline = function (pipeline) {

            Pipeline.deletePipeline(pipeline._id).then(function () {
                _.remove($scope.view.pipelines, function (p) {
                    return p._id === pipeline._id;
                });
            });
        };

    }]);
