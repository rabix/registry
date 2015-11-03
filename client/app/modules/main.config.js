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
        'angularytics',
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.router',
        'ngPrettyJson',
        'LocalForageModule',
        'ui-notification',
        'cfp.hotkeys',
        'Chronicle',
        'ui.sortable',
        'markdown',
        'ngAria',
        'nvd3',
        'registryApp.app',
        'registryApp.cliche',
        'registryApp.dyole',
        'registryApp.repo',
        'registryApp.task',
        'registryApp.common',
        'registryApp.ui'
    ])
    .constant('Const', {
        exposedSeparator: '$',
        generalSeparator: '.'
    })
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$localForageProvider', 'markdownConfig','AngularyticsProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $localForageProvider, markdownConfig,AngularyticsProvider) {
        $stateProvider
//            .state('home', {
//                url: '/',
//                templateUrl: 'modules/main/views/home.html',
//                controller: 'HomeCtrl'
//            })
            .state('builds', {
                url: '/builds',
                templateUrl: 'modules/main/views/builds.html',
                controller: 'BuildsCtrl'
            })
            .state('build', {
                url: '/build/:id',
                templateUrl: 'modules/main/views/build.html',
                controller: 'BuildCtrl'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'modules/main/views/settings.html',
                controller: 'SettingsCtrl'
            });

        ZeroClipboard.config({swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'});

        $urlRouterProvider.otherwise('/apps');

        $httpProvider.interceptors.push('HTTPInterceptor');

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

        markdownConfig.escapeHtml = true;

        AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);

    }])
    .run(['Angularytics', function(Angularytics){
        Angularytics.init();
    }]);
