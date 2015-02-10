/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 2:57 PM
 */

'use strict';

angular.module('registryApp.cliche', [])
    .config(['$routeProvider', '$localForageProvider', function ($routeProvider, $localForageProvider) {

        $routeProvider
            .when('/cliche/:type', {
                templateUrl: 'views/cliche/cliche.html',
                controller: 'ClicheCtrl'
            })
            .when('/cliche/:type/:id/:revision', {
                templateUrl: 'views/cliche/cliche.html',
                controller: 'ClicheCtrl'
            });

        ZeroClipboard.config({swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'});

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

    }]);
