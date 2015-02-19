/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp.app')
    .controller('WorkflowViewCtrl', ['$scope', '$q', '$state', '$stateParams', 'Sidebar', 'Loading', 'Workflow', 'User', 'Job', '$modal', '$templateCache', 'Helper', function ($scope, $q, $state, $stateParams, Sidebar, Loading, Workflow, User, Job, $modal, $templateCache, Helper) {

        Sidebar.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;

        $scope.view.page = {
            revisions: 1,
            jobs: 1
        };

        $scope.view.total = {
            revisions: 0,
            jobs: 0
        };

        $scope.view.workflow = {};
        $scope.view.explanation = false;
        $scope.view.tab = 'info';

        $scope.view.revisions = [];
        $scope.view.jobs = [];

        $scope.view.showDelete = false;

        $scope.view.domain = Helper.getDomain();

        $scope.view.classes = ['page', 'workflow-view'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Workflow.getRevision($stateParams.id).then(function (result) {
            $scope.view.workflow = result.data;

            $q.all([
                    Workflow.getRevisions(0, '', $scope.view.workflow.pipeline._id),
                    Job.getJobs(0, '', 'Workflow', $scope.view.workflow.pipeline._id),
                    User.getUser()
                ]).then(function(result) {
                    revisionsLoaded(result[0]);
                    jobsLoaded(result[1]);
                    $scope.view.user = result[2].user;
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

            $scope.view.total.revisions = result.total;

            var publicRevs = _.filter($scope.view.revisions, function (rev) {
                return rev.is_public;
            });

            if (publicRevs.length === 0) {
                $scope.view.showDelete = true;
            }
        };

        /**
         * Switch tab
         *
         * @param tab
         */
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

            Workflow.getRevisions(offset, '', $scope.view.workflow.pipeline._id).then(revisionsLoaded);

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

            Job.getJobs(offset, '', 'Workflow', $stateParams.id).then(jobsLoaded);
        };

        /**
         * Delete revision by id
         *
         * @param id
         */
        $scope.deleteRevision = function (id) {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {message: 'Are you sure you want to delete this revision?'}; }}
            });

            modalInstance.result.then(function () {
                Workflow.deleteRevision(id).then(function (data) {

                    _.remove($scope.view.revisions, function (rev) {
                        return rev._id === id;
                    });

                    $state.go('workflow-view', {id: data.latest});

                });
            });


        };

        /**
         * Delete current workflow
         */
        $scope.deleteWorkflow = function () {

            var id = $scope.view.workflow.pipeline._id;

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {message: 'Are you sure you want to delete this workflow?'}; }}
            });

            modalInstance.result.then(function () {
                Workflow.deleteWorkflow(id).then(function () {
                    $state.go('apps');
                });
            });

        };
    }]);
