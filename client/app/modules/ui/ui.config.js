/**
 * Created by filip on 11.5.15..
 */

angular.module('registryApp.ui', [])
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$localForageProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $localForageProvider) {
        $stateProvider
            .state('ui', {
                url: '/ui-page',
                templateUrl: 'modules/ui/main/views/home.html',
                controller: 'UICtrl'
            });

    }]);