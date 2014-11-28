'use strict';

angular.module('registryApp')
    .controller('AppCtrl', ['$scope', '$routeParams', '$q', '$injector', '$location', 'App', 'User', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $injector, $location, App, User, Sidebar, Loading) {

        Sidebar.setActive('tools');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 0;
        $scope.view.loading = true;
        $scope.view.app = null;
        $scope.view.revisions = [];
        $scope.view.tab = $routeParams.tab || 'info';
        $scope.view.isJsonVisible = false;

        $scope.view.classes = ['page', 'app'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $q.all([
                User.getUser(),
                App.getApp($routeParams.id, 'latest'),
                App.getRevisions(0, '', $routeParams.id)
            ]).then(function(result) {

                $scope.view.user = result[0].user;
                $scope.view.app = result[1].data;
                $scope.view.revision = result[1].revision;
                revisionsLoaded(result[2]);

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

        };

        /**
         * Get more revisions by offset
         *
         * @param offset
         */
        $scope.getMoreRevision = function(offset) {

            $scope.view.loading = true;

            App.getRevisions(offset, '', $routeParams.id).then(revisionsLoaded);
        };

        /**
         * Delete app
         */
        $scope.deleteApp = function() {

            var $modal = $injector.get('$modal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () { return {}; }}
            });

            modalInstance.result.then(function () {
                App.deleteApp($scope.view.app._id)
                    .then(function () {
                        $location.path('apps');
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
