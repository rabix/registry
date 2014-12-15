/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp.app')
    .controller('WorkflowViewCtrl', ['$scope', '$q', '$location', '$routeParams', 'Sidebar', 'Loading', 'Workflow', 'User', '$modal', '$templateCache', function ($scope, $q, $location, $routeParams, Sidebar, Loading, Workflow, User, $modal, $templateCache) {

        Sidebar.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;

        $scope.view.page = 1;
        $scope.view.total = 0;

        $scope.view.workflow = {};
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

        Workflow.getRevision($routeParams.id).then(function (result) {
            $scope.view.workflow = result.data;

            $q.all([
                    Workflow.getRevisions(0, '', $scope.view.workflow.pipeline._id),
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

                    $location.path('/workflow/' + data.latest);

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
                    $location.path('/apps');
                });
            });

        };
    }]);
