'use strict';

angular.module('registryApp')
    .controller('AppsCtrl', ['$scope', '$q', '$injector', 'App', 'Sidebar', 'Api', 'Loading', 'User',function ($scope, $q, $injector, App, Sidebar, Api, Loading, User) {

        Sidebar.setActive('tools');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 0;
        $scope.view.loading = true;
        $scope.view.apps = [];
        $scope.view.searchTerm = '';

        $scope.view.classes = ['page', 'apps'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /**
         * Callback when apps are loaded
         *
         * @param result
         */
        var appsLoaded = function(result) {

            $scope.view.apps = result.list;
            $scope.view.loading = false;

            $scope.view.total = result.total;
        };

        $q.all([
                App.getApps(0),
                User.getUser()
            ]).then(function(result) {
                appsLoaded(result[0]);
                $scope.view.user = result[1].user;
            });

        /**
         * Get more apps by offset
         *
         * @param offset
         */
        $scope.getMoreApps = function(offset) {

            $scope.view.loading = true;

            App.getApps(offset, $scope.view.searchTerm, $scope.view.mine).then(appsLoaded);
        };

        /**
         * Search apps by the term
         */
        $scope.searchApps = function() {

            $scope.view.page = 1;
            $scope.view.loading = true;

            App.getApps(0, $scope.view.searchTerm, $scope.view.mine).then(appsLoaded);

        };

        /**
         * Reset the search
         */
        $scope.resetSearch = function() {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            App.getApps(0, '', $scope.view.mine).then(appsLoaded);

        };

        /**
         * Toggle query for myApps filter
         */
        $scope.toggleMyApps = function () {

            $scope.view.page = 1;
            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            App.getApps(0, '', $scope.view.mine).then(appsLoaded);
        };

        /**
         * Delete app
         *
         * @param app
         */
        $scope.deleteApp = function (app) {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                App.deleteApp(app._id).then(function () {
                    _.remove($scope.view.apps, function (a) {
                        return a._id === app._id;
                    });
                });
            });

        };

    }]);
