'use strict';

/**
 * @ngdoc overview
 * @name registryApp
 * @description
 * # registryApp
 *
 * Main module of the application.
 */
angular
    .module('registryApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.router',
        'ngPrettyJson',
        'LocalForageModule',
        'hc.marked',
        'registryApp.app',
        'registryApp.cliche',
        'registryApp.dyole',
        'registryApp.repo',
        'registryApp.task',
        'registryApp.common'
    ])
    .constant('Const', {
        exposedSeparator: '$'
    })
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$localForageProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $localForageProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .state('builds', {
                url: '/builds',
                templateUrl: 'views/builds.html',
                controller: 'BuildsCtrl'
            })
            .state('build', {
                url: '/build/:id',
                templateUrl: 'views/build.html',
                controller: 'BuildCtrl'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'views/settings.html',
                controller: 'SettingsCtrl'
            });

        ZeroClipboard.config({swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'});

        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('HTTPInterceptor');

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

    }]);
