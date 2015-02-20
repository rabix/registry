/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 2:57 PM
 */

'use strict';

angular.module('registryApp.cliche', [])
    .config(['$stateProvider', '$localForageProvider', function ($stateProvider, $localForageProvider) {

        $stateProvider
            .state('cliche-new', {
                url: '/cliche/:type',
                templateUrl: 'views/cliche/cliche.html',
                controller: 'ClicheCtrl'
            })
            .state('cliche-edit', {
                url: '/cliche/:type/:id/:revision',
                templateUrl: 'views/cliche/cliche.html',
                controller: 'ClicheCtrl'
            });

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

    }]);
