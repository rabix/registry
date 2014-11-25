/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineViewCtrl', ['$scope', '$q', '$location', '$routeParams', 'Sidebar', 'Loading', 'Pipeline', 'User', '$modal', '$templateCache', function ($scope, $q, $location, $routeParams, Sidebar, Loading, Pipeline, User, $modal, $templateCache) {

        Sidebar.setActive('workflows');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 0;
        $scope.view.loading = true;
        $scope.view.pipeline = {};
        $scope.view.explanation = false;
        $scope.view.tab = 'info';

        $scope.view.revisions = [];

        $scope.view.showDelete = false;

        $scope.view.classes = ['page', 'pipeline-view'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Pipeline.getRevision($routeParams.id).then(function (result) {
            $scope.view.pipeline = result.data;

            $q.all([
                    Pipeline.getRevisions(0, '', $scope.view.pipeline.pipeline._id),
                    User.getUser()
                ]).then(function(result) {
                    revisionsLoaded(result[0]);
                    $scope.view.user = result[1].user;
                });

        });

        /**
         * Callback when revisions are loaded
         *
         * @param result
         */
        var revisionsLoaded = function(result) {

            $scope.view.revisions = result.list;
            $scope.view.loading = false;

            $scope.view.total = result.total;

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
         * Get more revisions by offset
         *
         * @param offset
         */
        $scope.getMoreRevision = function(offset) {

            $scope.view.loading = true;

            Pipeline.getRevisions(offset, '', $scope.view.pipeline.pipeline._id).then(revisionsLoaded);

        };
        
        $scope.deleteRevision = function (id) {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {message: "Are you sure you want to delete this revision?"}; }}
            });

            modalInstance.result.then(function () {
                Pipeline.deleteRevision(id).then(function (data) {

                    _.remove($scope.view.revisions, function (rev) {
                        return rev._id === id;
                    });

                    console.log(data.latest, data);
                    $location.path('/pipeline/' + data.latest);

                });
            });


        };
        
        $scope.deletePipeline = function () {
            var id = $scope.view.pipeline.pipeline._id;

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {message: "Are you sure you want to delete this workflow?"}; }}
            });

            modalInstance.result.then(function () {
                Pipeline.deletePipeline(id).then(function () {
                    $location.path('/pipelines');
                });
            });

        }
    }]);
