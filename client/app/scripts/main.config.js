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
        'ngRoute',
        'ngSanitize',
        'ui.bootstrap',
        'ngPrettyJson',
        'LocalForageModule',
        'hc.marked',
        'registryApp.app',
        'registryApp.cliche',
        'registryApp.dyole',
        'registryApp.repo'
    ])
    .config(['$routeProvider', '$httpProvider', '$localForageProvider', function ($routeProvider, $httpProvider, $localForageProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .when('/builds', {
                templateUrl: 'views/builds.html',
                controller: 'BuildsCtrl'
            })
            .when('/build/:id', {
                templateUrl: 'views/build.html',
                controller: 'BuildCtrl'
            })
            .when('/settings', {
                templateUrl: 'views/settings.html',
                controller: 'SettingsCtrl'
            })
            .when('/tasks', {
                templateUrl: 'views/tasks.html',
                controller: 'TasksCtrl'
            })
            .when('/task', {
                templateUrl: 'views/task.html',
                controller: 'TaskCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push('HTTPInterceptor');

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

    }]);
