/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche', [])
    .config(['$routeProvider', '$localForageProvider', function ($routeProvider, $localForageProvider) {

        $routeProvider
            .when('/cliche/:type', {
                templateUrl: 'views/cliche/home.html',
                controller: 'ClicheCtrl'
            })
            .when('/cliche/:type/:id/:revision', {
                templateUrl: 'views/cliche/home.html',
                controller: 'ClicheCtrl'
            });

        ZeroClipboard.config({swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'});

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

    }]);
