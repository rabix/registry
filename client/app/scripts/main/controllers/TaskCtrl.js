/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 11:14 AM
 */
'use strict';

angular.module('registryApp')
    .controller('TaskCtrl', ['$scope', '$q', '$modal', '$templateCache', '$location', 'Sidebar', 'Job', 'User', 'Repo', 'Workflow', function ($scope, $q, $modal, $templateCache, $location, Sidebar, Job, User, Repo, Workflow) {

        Sidebar.setActive('task tpls');

        $scope.view = {};
        $scope.view.job = {inputs: {}};
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

            $scope.view.pages = [];
            $scope.view.page = 1;
            $scope.view.total = 0;

        };

        /* init default values */
        setDefaults();

        /**
         * Get properties from app
         *
         * @param type
         * @param json
         * @returns {*}
         */
        var getProperties = function(type, json) {

            var deferred = $q.defer();

            if (type === 'Workflow') {
                // TODO: will be available directly, maybe
                if (json.exposed) {
                    _.extend(json.inputs.properties, json.exposed);
                }
            }

            deferred.resolve(json.inputs.properties);

            return deferred.promise;

        };

        /**
         * Pick app from the list
         */
        $scope.pickApp = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/app/partials/pick-app.html'),
                controller: 'PickAppCtrl',
                windowClass: 'modal-pick',
                backdrop: 'static',
                size: 'lg',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function (result) {

                $scope.view.app = result.app;
                $scope.view.type = result.type;

                getProperties(result.type, result.app.json)
                    .then(function(properties) {

                        $scope.view.job.app = angular.copy($scope.view.app.json);
                        $scope.view.job.app['@type'] = result.type;

                        //$scope.view.properties = properties;

                        setDefaults();
                        $scope.prepareForPagination(properties);

                    });

            });

        };

        /**
         * Prepare temp list for paginating
         *
         * @param origin
         */
        $scope.prepareForPagination = function(origin) {

            $scope.view.total = _.size(origin);

            var count = 0;

            _.each(origin, function(obj, name) {
                if (count % 10 === 0) {
                    $scope.view.pages.push([]);
                }

                $scope.view.pages[$scope.view.pages.length - 1].push({key: name, obj: obj});

                count += 1;
            });

        };

        /**
         * Create task json
         *
         * @returns {boolean}
         */
        $scope.create = function() {

            var isEmptyName = _.isEmpty($scope.view.name);
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

                Job.createJob($scope.view.job, $scope.view.name, data.repoId).then(function (result) {

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
            $location.path('/tasks');
        };

    }]);