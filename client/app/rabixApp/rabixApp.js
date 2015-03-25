'use strict';

angular.module('rabixApp', ['ui.router', 'registryApp.cliche'])
    .controller('ToolEditorCtrl', ['$scope', '$state', function ($scope, $state) {
        $state.go('cliche-editor-new', {type: 'tool'});
    }])

    .config(['$stateProvider', function ($stateProvider) {

        $stateProvider
            .state('cliche-editor-new', {
                url: '/cliche/:type',
                templateUrl: '../views/cliche/cliche.html',
                controller: 'ClicheCtrl'
            });
//            .state('cliche-editor-edit', {
//                url: '/asdf/:type/:id/:revision',
//                templateUrl: '../views/cliche/cliche.html',
//                controller: 'ClicheCtrl'
//            });
    }]);