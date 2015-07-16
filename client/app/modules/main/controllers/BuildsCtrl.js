'use strict';

angular.module('registryApp')
    .controller('BuildsCtrl', ['$scope', '$stateParams', '$window', 'Build', 'Sidebar', 'Loading', function ($scope, $stateParams, $window, Build, Sidebar, Loading) {

        Sidebar.setActive('builds');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 0;
        $scope.view.loading = true;
        $scope.view.builds = [];
        $scope.view.repo = $stateParams.repo;

        $scope.view.classes = ['page', 'builds'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        /**
         * Callback when builds are loaded
         *
         * @param result
         */
        var buildsLoaded = function(result) {

            $scope.view.builds = result.list;
            $scope.view.total = result.total;
            $scope.view.loading = false;

        };

        Build.getBuilds(0, $stateParams.repo).then(buildsLoaded);

        /**
         * Get more builds by offset
         *
         * @param offset
         */
        $scope.getMoreBuilds = function(offset) {

            $scope.view.loading = true;

            Build.getBuilds(offset, $stateParams.repo).then(buildsLoaded);
        };



    }]);
