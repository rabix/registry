'use strict';

angular.module('registryApp')
    .controller('AppCtrl', ['$scope', '$routeParams', '$q', 'App', 'Sidebar', 'Loading', function ($scope, $routeParams, $q, App, Sidebar, Loading) {

        Sidebar.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.app = null;
        $scope.view.revisions = [];
        $scope.view.tab = $routeParams.tab || 'info';

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
            App.getApp($routeParams.id, 'public'),
            App.getRevisions(0, '', $routeParams.id)
        ]).then(
            function(result) {

                $scope.view.app = result[0].data;
                revisionsLoaded(result[1]);

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
            $scope.view.versions = _.times($scope.view.revisions.length).reverse();

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

    }]);
