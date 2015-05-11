'use strict';

angular.module('registryApp')
    .controller('SettingsCtrl', ['$scope', '$modal', '$templateCache', 'Sidebar', 'User', 'Job', 'Loading', function ($scope, $modal, $templateCache, Sidebar, User, Job, Loading) {

        Sidebar.setActive('settings');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 1;
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

            $scope.view.jobs = result.list;
            $scope.view.total = result.total;
            $scope.view.loading = false;
        };

        Job.getJobs(0).then(jobsLoaded);

        /**
         * Get more jobs by offset
         *
         * @param offset
         */
        $scope.getMoreJobs = function(offset) {

            $scope.view.loading = true;

            Job.getJobs(offset).then(jobsLoaded);
        };


    }]);
