'use strict';

angular.module('registryApp')
    .controller('SettingsCtrl', ['$scope', '$modal', '$templateCache', 'Sidebar', 'User', 'Job', 'Loading', function ($scope, $modal, $templateCache, Sidebar, User, Job, Loading) {

        Sidebar.setActive('settings');

        $scope.view = {};
        $scope.view.generating = false;
        $scope.view.revoking = false;
        $scope.view.getting = false;

        $scope.view.loading = true;
        $scope.view.jobs = [];

        $scope.view.classes = ['page', 'settings'];
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

        /**
         * Generate the token for the user
         */
        $scope.generateToken = function() {

            $scope.view.generating = true;

            User.generateToken().then(function() {

                $scope.view.generating = false;

                $modal.open({
                    template: $templateCache.get('views/partials/confirm-close.html'),
                    controller: 'ModalCtrl',
                    windowClass: 'modal-info',
                    resolve: {data: function () { return {message: 'You successfully generated new token'}; }}
                });

            });
        };

        /**
         * Revoke the token of the user
         */
        $scope.revokeToken = function() {

            $scope.view.revoking = true;

            User.revokeToken().then(function() {

                $scope.view.revoking = false;

                $modal.open({
                    template: $templateCache.get('views/partials/confirm-close.html'),
                    controller: 'ModalCtrl',
                    windowClass: 'modal-info',
                    resolve: {data: function () { return {message: 'Your token has been revoked'}; }}
                });

            });
        };

        /**
         * Get the current token for the user
         */
        $scope.getToken = function () {

            $scope.view.getting = true;

            User.getToken().then(function(result) {

                $scope.view.getting = false;

                var message = _.isEmpty(result.token) ? 'You didn\'t generate token yet' : 'Your current token: ' + result.token;

                $modal.open({
                    template: $templateCache.get('views/partials/confirm-close.html'),
                    controller: 'ModalCtrl',
                    windowClass: 'modal-info',
                    resolve: {data: function () { return {message: message}; }}
                });

            });
        };

        /**
         * Callback when jobs are loaded
         *
         * @param result
         */
        var jobsLoaded = function(result) {

            $scope.view.paginator.prev = $scope.view.page > 1;
            $scope.view.paginator.next = ($scope.view.page * $scope.view.perPage) < result.total;
            $scope.view.total = Math.ceil(result.total / $scope.view.perPage);

            $scope.view.jobs = result.list;
            $scope.view.loading = false;
        };

        Job.getJobs(0).then(jobsLoaded);

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

                Job.getJobs(offset).then(jobsLoaded);

            }
        };

    }]);
