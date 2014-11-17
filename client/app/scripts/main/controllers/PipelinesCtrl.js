'use strict';

angular.module('registryApp')
    .controller('PipelinesCtrl', ['$scope', '$q', '$injector', 'Pipeline', 'Sidebar', 'Api', 'Loading', 'User',function ($scope, $q, $injector, Pipeline, Sidebar, Api, Loading, User) {

        Sidebar.setActive('workflows');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 0;
        $scope.view.loading = true;
        $scope.view.pipelines = [];
        $scope.view.searchTerm = '';
        $scope.view.mine = false;
        $scope.view.active = false;

        $scope.view.classes = ['page', 'pipelines'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /**
         * Callback when pipelines are loaded
         *
         * @param result
         */
        var pipelinesLoaded = function(result) {

            $scope.view.pipelines = result.list;
            $scope.view.total = result.total;
            $scope.view.loading = false;
        };

        $q.all([
                Pipeline.getPipelines(0),
                User.getUser()
            ]).then(function(result) {
                pipelinesLoaded(result[0]);
                $scope.view.user = result[1].user;
            });

        /**
         * Get more pipelines by offset
         *
         * @param offset
         */
        $scope.getMorePipelines = function(offset) {

            $scope.view.loading = true;

            Pipeline.getPipelines(offset, $scope.view.searchTerm, $scope.view.mine).then(pipelinesLoaded);
        };

        /**
         * Search pipelines by the term
         */
        $scope.searchPipelines = function() {

            $scope.view.page = 1;
            $scope.view.loading = true;

            Pipeline.getPipelines(0, $scope.view.searchTerm, $scope.view.mine).then(pipelinesLoaded);

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            Pipeline.getPipelines(0, '', $scope.view.mine).then(pipelinesLoaded);

        };

        /**
         * Delete pipeline
         */
        $scope.deletePipeline = function (pipeline) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                Pipeline.deletePipeline(pipeline._id).then(function () {
                    _.remove($scope.view.pipelines, function (p) {
                        return p._id === pipeline._id;
                    });
                });
            });

        };

        /**
         * Toggle query for myPipelines filter
         */
        $scope.toggleMyPipelines = function () {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            Pipeline.getPipelines(0, '', $scope.view.mine).then(pipelinesLoaded);
        };

        /**
         * Toggle revisions visibility
         *
         * @param pipeline
         */
        $scope.toggleRevisions = function(pipeline) {

            if (pipeline) {
                pipeline.active = !pipeline.active;
            } else {
                $scope.view.active = !$scope.view.active;
                _.map($scope.view.pipelines, function(p) {
                    return p.active = $scope.view.active;
                });
            }

        };

    }]);
