/**
 * Created by filip on 11.5.15..
 */

'use strict';

angular.module('registryApp.ui')
    .controller('UICtrl', ['$scope', function ($scope) {
        $scope.testClick = function () {
            console.log('click');
        };

        $scope.checkboxModel = true;

        $scope.numberInput = 300;

        $scope.disableCheckbox = function () {
            $scope.disable = !$scope.disable;
        };
        
        $scope.test = function () {
            console.log('work work');  
        };

        $scope.searchTerm = '';
        $scope.searchItems = [
            {sound: 'meow meow'},
            {sound: 'woff woff'},
            {sound: 'Baaa baaaa'},
            {sound: 'mooo moooo'},
            {sound: 'quack quack'}
        ];

        $scope.dropdown = 'Dropdown #1';
    }]);