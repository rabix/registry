'use strict';

angular.module('registryApp')
    .controller('AppCtrl', ['$scope', '$routeParams', 'App', 'Header', 'Loading', function ($scope, $routeParams, App, Header, Loading) {

        Header.setActive('apps');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.app = null;

        $scope.view.classes = ['page', 'app'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        App.getApp($routeParams.id).then(function(result) {
            $scope.view.loading = false;
            $scope.view.app = result.data;
        });


    }]);
