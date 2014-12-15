/**
 * Author: Milica Kadic
 * Date: 12/8/14
 * Time: 10:44 PM
 */
'use strict';

angular.module('registryApp')
    .controller('TasksCtrl', ['$scope', '$q', '$injector', 'Sidebar', 'Loading', 'Job', 'User', function ($scope, $q, $injector, Sidebar, Loading, Job, User) {

        Sidebar.setActive('task tpls');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 1;

        $scope.view.loading = true;
        $scope.view.jobs = [];

        $scope.view.classes = ['page', 'jobs'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /**
         * Callback when jobs are loaded
         *
         * @param result
         */
        var jobsLoaded = function(result) {

            $scope.view.jobs = result.list;
            $scope.view.total = result.total;
            $scope.view.loading = false;

        };

        $q.all([
                Job.getJobs(0),
                User.getUser()
            ]).then(function(result) {
                jobsLoaded(result[0]);
                $scope.view.user = result[1].user;
            });

        /**
         * Get more jobs by offset
         *
         * @param offset
         */
        $scope.getMoreJobs = function(offset) {

            $scope.view.loading = true;

            Job.getJobs(offset, $scope.view.searchTerm).then(jobsLoaded);
        };

        /**
         * Search jobs by the name
         */
        $scope.searchJobs = function() {

            $scope.view.page = 1;
            $scope.view.loading = true;

            Job.getJobs(0, $scope.view.searchTerm).then(jobsLoaded);

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            Job.getJobs(0, '').then(jobsLoaded);

        };

        /**
         * Delete job
         *
         * @param job
         */
        $scope.deleteJob = function(job) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');
            var $route = $injector.get('$route');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                Job.deleteJob(job._id)
                    .then(function () {
                        $route.reload();
                    });
            });

        };


    }]);
