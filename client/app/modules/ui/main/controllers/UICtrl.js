/**
 * Created by filip on 11.5.15..
 */

'use strict';

angular.module('registryApp.ui')
    .controller('UICtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.view = {};
        $scope.view.activeTab = 'buttons';

        $scope.switchTab = function (tab) {
            $scope.view.activeTab = tab;
        };

        $scope.submitSearch = function (search) {
            console.log('Submitting search: %s', search);
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

        $scope.view.isDisabled = true;

        $timeout(function () {
            $scope.view.isDisabled = false;
        }, 4000);

    }]);