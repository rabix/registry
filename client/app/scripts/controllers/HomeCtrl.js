'use strict';

angular.module('registryApp')
    .controller('HomeCtrl', ['$scope', '$timeout', 'Header', 'User', 'Loading', function ($scope, $timeout, Header, User, Loading) {

        var subscribeTimeoutId;

        Header.setActive('home');

        $scope.view = {};
        $scope.view.showError = false;
        $scope.view.message = {};
        $scope.view.loading = false;

        $scope.view.classes = ['page', 'home'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        $scope.subscribe = {};
        $scope.subscribe.email = '';

        /**
         * Subscribe user to the mailing list
         *
         * @returns {boolean}
         */
        $scope.subscribeToMailingList = function () {

            $scope.view.showError = false;
            $scope.view.message = {};

            if ($scope.view.form.$invalid) {
                $scope.view.showError = true;
                return false;
            }

            console.log(User.subscribe($scope.subscribe.email));
            User.subscribe($scope.subscribe.email).then(function (result) {

                console.log(result);
                $scope.view.message.trace = 'You\'ve subscribed successfully';
                $scope.view.message.status = true;

                $scope.cancelSubscribeTimeout();

                subscribeTimeoutId = $timeout(function () {
                    $scope.subscribe = {};
                    $scope.view.showError = false;
                    $scope.view.message = {};
                }, 3000);

            });

        };

        /**
         * Cancel the subscribe timeout
         */
        $scope.cancelSubscribeTimeout = function () {
            if (angular.isDefined(subscribeTimeoutId)) {
                $timeout.cancel(subscribeTimeoutId);
                subscribeTimeoutId = undefined;
            }
        };

        $scope.$on('$destroy', function () {
            $scope.cancelSubscribeTimeout();
        });

    }]);
