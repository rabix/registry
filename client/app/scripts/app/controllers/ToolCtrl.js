'use strict';

angular.module('registryApp.app')
    .controller('ToolCtrl', ['$scope', '$routeParams', '$q', '$injector', '$location', 'Tool', 'User', 'Job', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $injector, $location, Tool, User, Job, Sidebar, Loading) {

        Sidebar.setActive('apps');

        $scope.view = {};

        $scope.view.page = {
            revisions: 1,
            jobs: 1
        };

        $scope.view.total = {
            revisions: 0,
            jobs: 0
        };

        $scope.view.loading = true;

        $scope.view.tool = null;
        $scope.view.revisions = [];
        $scope.view.jobs = [];

        $scope.view.tab = $routeParams.tab || 'info';
        $scope.view.isJsonVisible = false;

        $scope.view.classes = ['page', 'tool'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $q.all([
                User.getUser(),
                Tool.getTool($routeParams.id, 'latest'),
                Tool.getRevisions(0, '', $routeParams.id)
            ]).then(function(result) {

                $scope.view.user = result[0].user;
                $scope.view.tool = result[1].data;
                $scope.view.revision = result[1].revision;

                $scope.view.revisions = result[2].list;
                $scope.view.total.revisions = result[2].total;

                $scope.view.type = $scope.view.tool.is_script ? 'script' : 'tool';

                $scope.view.atType = $scope.view.tool.is_script ? 'Script' : 'CommandLine';

                Job.getJobs(0, '', $scope.view.atType, $routeParams.id).then(jobsLoaded);

            });

        /**
         * Callback when revisions are loaded
         *
         * @param result
         */
        var revisionsLoaded = function(result) {

            $scope.view.revisions = result.list;
            $scope.view.loading = false;

            $scope.view.total.revisions = result.total;

        };

        /**
         * Get more revisions by offset
         *
         * @param offset
         */
        $scope.getMoreRevision = function(offset) {

            $scope.view.loading = true;

            Tool.getRevisions(offset, '', $routeParams.id).then(revisionsLoaded);
        };

        /**
         * Callback when jobs are loaded
         *
         * @param result
         */
        var jobsLoaded = function (result) {

            $scope.view.jobs = result.list;
            $scope.view.loading = false;

            $scope.view.total.jobs = result.total;

        };

        /**
         * Get more jobs by offset
         *
         * @param offset
         */
        $scope.getMoreJobs = function(offset) {

            $scope.view.loading = true;

            Job.getJobs(offset, '', $scope.view.atType, $routeParams.id).then(jobsLoaded);
        };

        /**
         * Delete tool
         */
        $scope.deleteTool = function() {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                Tool.deleteTool($scope.view.tool._id)
                    .then(function () {
                        $location.path('/apps');
                    });
            });

        };

        /**
         * Toggle json visibility
         */
        $scope.toggleJson = function() {
            $scope.view.isJsonVisible = !$scope.view.isJsonVisible;
        };

    }]);
