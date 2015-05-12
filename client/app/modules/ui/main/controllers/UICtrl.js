/**
 * Created by filip on 11.5.15..
 */

angular.module('registryApp.ui')
    .controller('UICtrl', ['$scope', function ($scope) {
        $scope.testClick = function () {
            console.log('click');
        }
    }]);