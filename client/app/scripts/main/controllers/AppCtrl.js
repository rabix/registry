'use strict';

angular.module('registryApp')
    .controller('AppCtrl', ['$scope', '$routeParams', '$q', '$injector', '$location', 'App', 'User', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, $injector, $location, App, User, Sidebar, Loading) {

        Sidebar.setActive('tools');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.app = null;
        $scope.view.revisions = [];
        $scope.view.tab = $routeParams.tab || 'info';
        $scope.view.canDelete = false;
        $scope.view.isJsonVisible = false;

        $scope.view.classes = ['page', 'app'];
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

        $q.all([
            User.getUser(),
            App.getApp($routeParams.id, 'public'),
            App.getRevisions(0, '', $routeParams.id)
        ]).then(function(result) {

                $scope.view.user = result[0].user;
                $scope.view.app = result[1].data;
                $scope.view.canDelete = result[1].publicCount === 0 && ($scope.view.user && $scope.view.user.id === $scope.view.app.user._id);
                revisionsLoaded(result[2]);

            });

        /**
         * Callback when revisions are loaded
         *
         * @param result
         */
        var revisionsLoaded = function(result) {

            $scope.view.paginator.prev = $scope.view.page > 1;
            $scope.view.paginator.next = ($scope.view.page * $scope.view.perPage) < result.total;
            $scope.view.total = Math.ceil(result.total / $scope.view.perPage);

            $scope.view.revisions = result.list;

            $scope.view.loading = false;
        };

        /**
         * Go to the next/prev page
         *
         * @param dir
         */
        $scope.goToPage = function(dir) {

            if (!$scope.view.loading) {

                if (dir === 'prev') { $scope.view.page -= 1; }
                if (dir === 'next') { $scope.view.page += 1; }

                $scope.view.loading = true;
                var offset = ($scope.view.page - 1) * $scope.view.perPage;

                App.getRevisions(offset, '', $routeParams.id).then(revisionsLoaded);

            }
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
