/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineViewCtrl', ['$scope', '$q', '$location', '$routeParams', 'Sidebar', 'Loading', 'Pipeline', function ($scope, $q, $location, $routeParams, Sidebar, Loading, Pipeline) {

        Sidebar.setActive('workflows');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.pipeline = {};
        $scope.view.explanation = false;
        $scope.view.tab = 'info';

        $scope.view.revisions = [];

        $scope.view.paginator = {
            prev: false,
            next: false
        };

        $scope.view.page = 1;
        $scope.view.perPage = 25;
        $scope.view.total = 0;

        $scope.view.showDelete = false;

        $scope.view.classes = ['page', 'pipeline-view'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Pipeline.getRevision($routeParams.id).then(function (result) {
            $scope.view.pipeline = result.data;

                Pipeline.getRevisions(0, '', $scope.view.pipeline.pipeline._id).then(function (res) {
                    revisionsLoaded(res);
                });

        });

        /**
         * Callback when revisions are loaded
         *
         * @param result
         */
        var revisionsLoaded = function(result) {

            $scope.view.paginator.prev = $scope.view.page > 1;
            $scope.view.paginator.next = ($scope.view.page * $scope.view.perPage) < result.total;
            $scope.view.total = Math.ceil(result.total / $scope.view.perPage);

            $scope.view.revisions = result.list;

            $scope.view.loading = false;

            var publicRevs = _.filter($scope.view.revisions, function (rev) {
                return rev.is_public;
            });

            if (publicRevs.length === 0) {
                $scope.view.showDelete = true;
            }
        };
        
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;
        };

        /**
         * Go to the next/prev page
         *
         * @param dir
         */
        $scope.goToPage = function(dir) {

            if (!$scope.view.loading) {

                if (dir === 'prev') { $scope.view.page -= 1; }
                if (dir === 'next') { $scope.view.page += 1; }

                $scope.view.loading = true;
                var offset = ($scope.view.page - 1) * $scope.view.perPage;

                Pipeline.getRevisions(offset, '', $routeParams.id).then(revisionsLoaded);
            }
        };
        
        $scope.deleteRevision = function (id) {
            Pipeline.deleteRevision(id).then(function (data) {

                _.remove($scope.view.revisions, function (rev) {
                    return rev._id === id;
                });

                console.log(data.latest, data);
                $location.path('/pipeline/' + data.latest);

            });
        };
        
        $scope.deletePipeline = function () {
            var id = $scope.view.pipeline.pipeline._id;

            Pipeline.deletePipeline(id).then(function () {
                $location.path('/pipelines');
            });
        }
    }]);
