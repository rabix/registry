/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 11:14 AM
 */
'use strict';

angular.module('registryApp')
    .controller('JobCtrl', ['$scope', '$q', '$modal', '$templateCache', '$location', 'Sidebar', 'Job', 'User', 'Repo', 'rawJob', function ($scope, $q, $modal, $templateCache, $location, Sidebar, Job, User, Repo, rawJob) {

        Sidebar.setActive('jobs');

        $scope.view = {};
        $scope.view.job = rawJob;
        $scope.view.app = null;
        $scope.view.userRepos = [];

        $q.all([
                Repo.getRepos(0, '', true),
                User.getUser()
            ]).then(function(result) {
                $scope.view.userRepos = result[0].list;
                $scope.view.user = result[1].user;
            });


        /**
         * Set default values
         */
        var setDefaults = function() {

            $scope.view.list = {tmp: [], part: []};

            $scope.view.page = 1;
            $scope.view.total = 0;

        };

        /* init default values */
        setDefaults();


        $scope.pickApp = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/pick-app.html'),
                controller: 'PickAppCtrl',
                windowClass: 'modal-pick',
                backdrop: 'static',
                size: 'lg',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function (result) {
                $scope.view.app = result.app;
                $scope.view.type = result.type;

                if ($scope.view.type === 'workflow') {
                    return false;
                }

                setDefaults();
                $scope.prepareForPagination($scope.view.app.json.inputs.properties);
            });

        };

        /**
         * Prepare temp list for paginating
         *
         * @param origin
         */
        $scope.prepareForPagination = function(origin) {

            $scope.view.total = _.size(origin);

            _.each(origin, function(obj, name) {
                $scope.view.list.tmp.push({key: name, obj: obj});
            });

            $scope.getMore(0);

        };

        /**
         * Get next/prev page
         *
         * @param offset
         */
        $scope.getMore = function(offset) {

            $scope.view.list.part = [];

            var times = $scope.view.list.tmp.length > 10 ? 10 : $scope.view.list.tmp.length;

            _.times(times, function(i) {
                $scope.view.list.part.push($scope.view.list.tmp[offset + i]);
            });

        };

        $scope.create = function() {

            var isEmptyName = _.isEmpty($scope.view.job.name);
            var isEmptyApp = _.isEmpty($scope.view.app);

            if (isEmptyName || isEmptyApp) {

                var errors = [];

                if (isEmptyName) { errors.push('You must enter the name of the job'); }
                if (isEmptyApp) { errors.push('You must pick the app for your job'); }

                $modal.open({
                    template: $templateCache.get('views/partials/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: errors}; }}
                });

                return false;
            }

            var modalInstance = $modal.open({
                controller: 'PickRepoModalCtrl',
                template: $templateCache.get('views/dyole/pick-repo-name.html'),
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {repos: $scope.view.userRepos, type: 'save'};}}

            });

            modalInstance.result.then(function(data) {

                $scope.view.saving = true;

                var json = $scope.view.job;
                json.app = $scope.view.app.json;

                Job.createJob(json, $scope.view.job.name, data.repoId).then(function (result) {

                    console.log(result);

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/job-url-response.html'),
                        controller: 'ModalCtrl',
                        resolve: { data: function () { return { trace: result }; }}
                    });

                    modalInstance.result.then(goBack, goBack);


                }, function () {
                    $scope.view.saving = false;
                });
            });


        };

        /**
         * Go back to the job listing
         */
        var goBack = function() {
            $location.path('/jobs');
        };

    }]);