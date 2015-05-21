/**
 * Created by filip on 11.5.15..
 */

'use strict';

angular.module('registryApp.ui')
    .controller('UICtrl', ['$scope', function ($scope) {
        $scope.view = {};
        $scope.view.activeTab = 'tabs';

        $scope.switchTab = function (tab) {
            $scope.view.activeTab = tab;
        };

        $scope.tabCb = function (tab) {

            console.log('ctrl got this tab from rbTabs: ', tab);
                
        };

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
            {sound: 'meow meow', animal: 'cat'},
            {sound: 'woff woff', animal: 'dog'},
            {sound: 'Baaa baaaa', animal: 'sheep'},
            {sound: 'mooo moooo', animal: 'cow'},
            {sound: 'quack quack', animal: 'duck'}
        ];
        $scope.selectedAnimal = 'cat';

        $scope.dropdown = 'Dropdown #1';
    }]);