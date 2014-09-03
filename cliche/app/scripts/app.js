'use strict';

angular
    .module('clicheApp', [
        'ngResource',
        'ngRoute',
        'ui.bootstrap',
        'ngPrettyJson',
        'LocalForageModule'
    ])
    .config(['$routeProvider', '$httpProvider', '$localForageProvider', function ($routeProvider, $httpProvider, $localForageProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push('HTTPInterceptor');

        $localForageProvider.config({
            name: 'clicheApp',
            version: 1.0,
            storeName: 'clicheDB'
        });

        ZeroClipboard.config({swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'});

    }]);
