'use strict';

angular.module('rabixApp', ['ui.router', 'registryApp.cliche'])
    .controller('ToolEditorCtrl', ['$scope', '$state', function ($scope, $state) {

    }])

    .config(['$stateProvider', function ($stateProvider) {

        //$stateProvider
        //    .state('cliche-editor-new', {
        //        url: '/asdf/:type',
        //        templateUrl: '../views/cliche/cliche.html',
        //        controller: 'ClicheCtrl'
        //    })
        //    .state('cliche-editor-edit', {
        //        url: '/asdf/:type/:id/:revision',
        //        templateUrl: '../views/cliche/cliche.html',
        //        controller: 'ClicheCtrl'
        //    });
    }]);