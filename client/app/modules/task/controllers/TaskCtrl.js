/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 11:14 AM
 */
'use strict';

angular.module('registryApp.task')
    .controller('TaskCtrl', ['$scope', '$q', '$modal', '$templateCache', '$state', '$stateParams', 'Sidebar', 'Loading', 'Job', 'User', 'Repo', 'Workflow', 'BeforeUnload', 'BeforeRedirect', function ($scope, $q, $modal, $templateCache, $state, $stateParams, Sidebar, Loading, Job, User, Repo, Workflow, BeforeUnload, BeforeRedirect) {

        Sidebar.setActive('task tpls');

        $scope.form = {};
        $scope.view = {};

        $scope.view.job = {json: {inputs: {}, '@type': 'TaskTemplate'}};
        $scope.view.app = null;
        $scope.view.mode = $stateParams.id === 'new' ? 'new' : 'edit';
        $scope.view.userRepos = [];
        $scope.view.properties = [];
        $scope.view.ref = null;

        $scope.view.classes = ['page', 'job'];

        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $q.all([
                Repo.getRepos(0, '', true),
                User.getUser()
            ]).then(function(result) {
                $scope.view.userRepos = result[0].list;
                $scope.view.user = result[1].user;
            });

        if ($stateParams.id !== 'new') {

            $scope.view.loading = true;

            Job.getJob($stateParams.id)
                .then(function (result) {

                    $scope.view.job = result.data;

                    $scope.view.app = result.data.json.app;
                    $scope.view.type = result.data.type;

                    $scope.view.properties = $scope.view.app.inputs;

                    $scope.view.loading = false;
                });
        }

        /**
         * Remove empty values (only first level, non recursion and non-array like elements)
         * Note: If you see empty values in array REMOVE THEM BY HAND JUST LIKE YOU ADDED THEM
         *
         * @param {object} json
         */
        var removeEmpty = function (json) {

            _.each(json, function (obj, key) {
                if ((typeof obj === 'string' || typeof obj === 'object') && _.isEmpty(obj)) {
                    delete json[key];
                }

            });

        };

        /**
         * Pick app from the list
         */
        $scope.pickApp = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/task/partials/pick-app.html'),
                controller: 'PickAppCtrl',
                windowClass: 'modal-pick',
                backdrop: 'static',
                size: 'lg',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function (result) {

                $scope.view.ref = result.id;

                $scope.view.app = result.app.json;
                $scope.view.type = result.type;

                $scope.view.job.json.app = angular.copy($scope.view.app);
                $scope.view.job.json.app['@type'] = result.type;

                $scope.view.properties = $scope.view.app.inputs;

            });

        };

        /**
         * Get form validation error message
         *
         * @returns {string}
         */
        var getValidationMessage = function () {

            var errorsNum = 0;

            _.each($scope.form.jobForm.$error, function (errors, key) {
                if (key !== 'required') {
                    errorsNum += errors.length;
                }
            });

            if (errorsNum > 0) {
                return 'You must enter valid values (' + errorsNum + ' ' + 'error' + (errorsNum !== 1 ? 's' : '') + ')';
            } else {
                return '';
            }

        };

        /**
         * Update task json
         *
         * @returns {boolean}
         */
        $scope.update = function () {

            var isEmptyName = _.isEmpty($scope.view.job.name);
            var validationMsg = getValidationMessage();

            if (isEmptyName || validationMsg) {

                var errors = [];

                if (isEmptyName) { errors.push('You must enter the name of the job'); }
                if (validationMsg) { errors.push(validationMsg); }

                $modal.open({
                    template: $templateCache.get('views/partials/validation.html'),
                    size: 'sm',
                    controller: 'ModalCtrl',
                    windowClass: 'modal-validation',
                    resolve: {data: function () { return {messages: errors}; }}
                });

                return false;
            }

            $scope.view.saving = true;
            $scope.view.loading = true;

            removeEmpty($scope.view.job.json.inputs);

            var job = {
                name: $scope.view.job.name,
                json: $scope.view.job.json
            };

            Job.updateJob($stateParams.id, job)
                .then(function (result) {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/job-url-response.html'),
                        controller: 'ModalCtrl',
                        resolve: { data: function () { return { trace: result }; }}
                    });

                    BeforeRedirect.setReload(true);

                    modalInstance.result.then(function () {
                        $route.reload();
                    }, function () {
                        $route.reload();
                    });

                    $scope.view.saving = false;
                    $scope.view.loading = false;

                }, function () {
                    $scope.view.saving = false;
                    $scope.view.loading = false;
                });
        };

        /**
         * Delete task
         */
        $scope.delete = function() {

            if (_.isUndefined($scope.view.job._id)) { return false; }

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                Job.deleteJob($scope.view.job._id)
                    .then(function () {
                        BeforeRedirect.setReload(true);
                        $state.go('tasks');
                    });
            });

        };

        /**
         * Create task json
         *
         * @returns {boolean}
         */
        $scope.create = function() {

            var isEmptyName = _.isEmpty($scope.view.job.name);
            var isEmptyApp = _.isEmpty($scope.view.app);
            //var isFormInvalid = $scope.form.jobForm.$invalid;
            var validationMsg = getValidationMessage();

            if (isEmptyName || isEmptyApp || validationMsg) {

                var errors = [];

                if (isEmptyName) { errors.push('You must enter the name of the job'); }
                if (isEmptyApp) { errors.push('You must pick the app for your job'); }
                if (validationMsg) { errors.push(validationMsg); }

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
                template: $templateCache.get('views/repo/pick-repo-name.html'),
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {repos: $scope.view.userRepos, type: 'save'};}}

            });

            modalInstance.result.then(function(data) {

                $scope.view.saving = true;
                $scope.view.loading = true;

                removeEmpty($scope.view.job.json.inputs);

                var job = {
                    name: $scope.view.job.name,
                    json: $scope.view.job.json,
                    ref: $scope.view.ref,
                    type: $scope.view.type,
                    repo: data.repoId
                };

                Job.createJob(job).then(function (result) {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/job-url-response.html'),
                        controller: 'ModalCtrl',
                        resolve: { data: function () { return { trace: result }; }}
                    });

                    BeforeRedirect.setReload(true);

                    modalInstance.result.then(function () {
                        $state.go('task', {id: result.id});
                    }, function () {
                        $state.go('task', {id: result.id});
                    });


                }, function () {
                    $scope.view.saving = false;
                    $scope.view.loading = false;
                });
            });

        };

        var onBufferUnloadOff = BeforeUnload.register(function() { return 'Please save your changes before leaving.'; });
        var onBeforeRedirectOff = BeforeRedirect.register();

        $scope.$on('$destroy', function() {
            onBufferUnloadOff();
            onBufferUnloadOff = undefined;

            onBeforeRedirectOff();
            onBeforeRedirectOff = undefined;
        });

    }]);